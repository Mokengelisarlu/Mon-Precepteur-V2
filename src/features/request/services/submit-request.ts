import {
  childDraftToFormValues,
  childDraftToRecord,
  childFormSchema,
  type ChildDraftRecord,
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
  ChildLearningNeedDraft,
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
  readonly needsByChildId: Readonly<Record<string, readonly ChildLearningNeedDraft[]>>;
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
    address: contact.address ?? '',
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

  const childIds = draft.children.map((child) => child.id);
  if (new Set(childIds).size !== childIds.length) {
    return failure('review.error.invalid');
  }

  let children: readonly ChildRecord[] = [];
  let needDrafts: readonly LearningNeedDraft[];

  if (draft.journeyType === 'child') {
    if (draft.children.length === 0) {
      return failure('review.error.noChildren');
    }
    if (draft.selfNeeds.length > 0) {
      return failure('review.error.invalid');
    }
    if (Object.keys(draft.needsByChildId).some((childId) => !childIds.includes(childId))) {
      return failure('review.error.invalid');
    }

    for (const child of draft.children) {
      if (!childFormSchema.safeParse(childDraftToFormValues(child)).success) {
        return failure('review.error.invalid');
      }
      const childNeeds = draft.needsByChildId[child.id] ?? [];
      if (childNeeds.length === 0) {
        return failure('review.error.noNeeds');
      }
      if (childNeeds.some((need) => need.childId !== child.id || !needIsValid(need))) {
        return failure('review.error.invalid');
      }
    }

    needDrafts = draft.children.flatMap((child) => draft.needsByChildId[child.id] ?? []);
    if (
      needDrafts.some(
        (need) =>
          need.learnerIsClient ||
          need.childId === undefined ||
          !childIds.includes(need.childId) ||
          !needIsValid(need),
      )
    ) {
      return failure('review.error.invalid');
    }
    children = draft.children.map((child) => childDraftToRecord(child, clientId));
  } else {
    if (draft.children.length > 0 || Object.keys(draft.needsByChildId).length > 0) {
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
    needDrafts = draft.selfNeeds;
  }

  const nonEmptyNeedIds = asNonEmpty(needDrafts.map((need) => need.id));
  if (nonEmptyNeedIds === null) {
    return failure('review.error.noNeeds');
  }
  if (new Set(nonEmptyNeedIds).size !== nonEmptyNeedIds.length) {
    return failure('review.error.invalid');
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
    needIds: nonEmptyNeedIds,
    tutorPreference: draft.tutorPreference,
    status: 'received' as const,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
  };

  let request: RequestRecord;
  if (draft.journeyType === 'child') {
    const nonEmptyChildIds = asNonEmpty(childIds);
    if (nonEmptyChildIds === null) {
      return failure('review.error.noChildren');
    }
    request = { ...commonRequestFields, type: 'child', childIds: nonEmptyChildIds };
  } else {
    request = { ...commonRequestFields, type: 'self', childIds: [] };
  }

  const needs = needDrafts.map((need) => ({
    ...need,
    requestId: request.id,
  }));
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
