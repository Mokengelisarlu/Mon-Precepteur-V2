import {
  childDraftToFormValues,
  childDraftToRecord,
  childFormSchema,
  type ChildDraftRecord,
  type ChildOnboardingData,
  type ChildRecord,
} from '@/features/children';
import { contactFormSchema, type ClientContactDetails, type ClientProfile } from '@/features/client';
import type { Notification } from '@/features/notification';
import type { TranslationKey } from '@/lib/i18n/types';

import { generateRequestReference } from '../lib/reference';
import { needFormSchema } from '../validation';
import type {
  ActivityEvent,
  AdultLearningNeedDraft,
  JourneyType,
  LearningNeed,
  LearningNeedDraft,
  RequestRecord,
  TutorPreference,
} from '../types';
import { needDraftToFormValues } from './need-draft';

export interface RequestDraftData {
  readonly journeyType: JourneyType | null;
  readonly contact: ClientContactDetails | null;
  readonly clientId: string | null;
  readonly children: readonly ChildDraftRecord[];
  readonly onboardingByChildId: Readonly<Record<string, ChildOnboardingData>>;
  readonly selfNeeds: readonly AdultLearningNeedDraft[];
  readonly tutorPreference: TutorPreference;
}

export interface SubmissionIds {
  readonly requestId: string;
  readonly eventId: string;
  readonly notificationId: string;
}

export interface SubmitRequestInput {
  readonly draft: RequestDraftData;
  readonly client: ClientProfile | undefined;
  readonly existingRequests: readonly RequestRecord[];
  readonly ids: SubmissionIds;
  readonly now: number;
}

export interface SubmittedRequestData {
  readonly request: RequestRecord;
  readonly children: readonly ChildRecord[];
  readonly needs: readonly LearningNeed[];
  readonly activityEvent: ActivityEvent;
  readonly notification: Notification;
}

export type SubmitRequestFailureKey =
  | 'review.error.noChildren'
  | 'review.error.noNeeds'
  | 'review.error.contact'
  | 'review.error.pin'
  | 'review.error.invalid';

export type SubmitRequestResult =
  | { readonly ok: true; readonly value: SubmittedRequestData }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: 'VALIDATION_FAILED';
        readonly message: SubmitRequestFailureKey;
      };
    };

function failure(message: SubmitRequestFailureKey): SubmitRequestResult {
  return {
    ok: false,
    error: { code: 'VALIDATION_FAILED', message },
  };
}

function asNonEmpty<T>(values: readonly T[]): readonly [T, ...T[]] | null {
  const [first, ...remaining] = values;
  return first === undefined ? null : [first, ...remaining];
}

function contactIsValid(contact: ClientContactDetails): boolean {
  return contactFormSchema.safeParse({
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    email: contact.email ?? '',
    city: contact.city ?? '',
    commune: contact.commune ?? '',
    quartier: contact.quartier ?? '',
    avenue: contact.avenue ?? '',
    number: contact.number ?? '',
  }).success;
}

function needIsValid(need: LearningNeedDraft): boolean {
  return needFormSchema.safeParse(needDraftToFormValues(need)).success;
}

function hasPinCredentials(client: ClientProfile | undefined, clientId: string): boolean {
  return (
    client !== undefined &&
    client.id === clientId &&
    client.pinHash.length > 0 &&
    client.pinSalt.length > 0
  );
}

export function submitRequest(input: SubmitRequestInput): SubmitRequestResult {
  const { draft, client, existingRequests, ids, now } = input;
  const clientId = draft.clientId;

  if (draft.journeyType === null || clientId === null || draft.contact === null) {
    return failure('review.error.contact');
  }
  if (!contactIsValid(draft.contact)) {
    return failure('review.error.contact');
  }
  if (!hasPinCredentials(client, clientId)) {
    return failure('review.error.pin');
  }

  let children: readonly ChildRecord[] = [];
  let needs: readonly LearningNeed[] = [];
  let learningContext: ChildOnboardingData | null = null;

  if (draft.journeyType === 'child') {
    if (draft.children.length === 0) {
      return failure('review.error.noChildren');
    }
    if (draft.children.length !== 1) {
      return failure('review.error.invalid');
    }
    const child = draft.children[0];
    if (child === undefined) {
      return failure('review.error.noChildren');
    }
    if (draft.selfNeeds.length > 0) {
      return failure('review.error.invalid');
    }
    if (
      Object.keys(draft.onboardingByChildId).some((childId) => childId !== child.id)
    ) {
      return failure('review.error.invalid');
    }

    if (!childFormSchema.safeParse(childDraftToFormValues(child)).success) {
      return failure('review.error.invalid');
    }
    learningContext = draft.onboardingByChildId[child.id] ?? null;
    if (learningContext === null) {
      return failure('review.error.invalid');
    }
    children = [childDraftToRecord(child, clientId)];
  } else {
    if (draft.children.length > 0 || Object.keys(draft.onboardingByChildId).length > 0) {
      return failure('review.error.invalid');
    }
    if (draft.selfNeeds.length === 0) {
      return failure('review.error.noNeeds');
    }
    if (
      draft.selfNeeds.some(
        (need) => !need.learnerIsClient || need.childId !== undefined || !needIsValid(need),
      )
    ) {
      return failure('review.error.invalid');
    }
    const nonEmptyNeedIds = asNonEmpty(draft.selfNeeds.map((need) => need.id));
    if (nonEmptyNeedIds === null) {
      return failure('review.error.noNeeds');
    }
    if (new Set(nonEmptyNeedIds).size !== nonEmptyNeedIds.length) {
      return failure('review.error.invalid');
    }
    needs = draft.selfNeeds.map((need) => ({
      ...need,
      requestId: ids.requestId,
    }));
  }

  const year = new Date(now).getFullYear();
  const reference = generateRequestReference(
    year,
    existingRequests.map((request) => request.reference),
  );
  const commonRequestFields = {
    id: ids.requestId,
    reference,
    clientId,
    tutorPreference: draft.journeyType === 'child' ? 'none' : draft.tutorPreference,
    status: 'received' as const,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
  };

  let request: RequestRecord;
  if (draft.journeyType === 'child') {
    const child = draft.children[0];
    if (child === undefined) {
      return failure('review.error.noChildren');
    }
    if (learningContext === null) {
      return failure('review.error.invalid');
    }
    request = {
      ...commonRequestFields,
      type: 'child',
      childIds: [child.id],
      needIds: [],
      learningContext,
    };
  } else {
    const needIds = asNonEmpty(needs.map((need) => need.id));
    if (needIds === null) {
      return failure('review.error.noNeeds');
    }
    request = { ...commonRequestFields, type: 'self', childIds: [], needIds };
  }

  const activityEvent: ActivityEvent = {
    id: ids.eventId,
    requestId: request.id,
    entityType: 'request',
    entityId: request.id,
    actor: 'client',
    toStatus: 'received',
    createdAt: now,
  };
  const notification: Notification = {
    id: ids.notificationId,
    clientId: request.clientId,
    requestId: request.id,
    type: 'request_received',
    titleKey: 'notification.requestReceived.title' satisfies TranslationKey,
    bodyKey: 'notification.requestReceived.body' satisfies TranslationKey,
    params: { reference },
    createdAt: now,
  };

  return {
    ok: true,
    value: { request, children, needs, activityEvent, notification },
  };
}
