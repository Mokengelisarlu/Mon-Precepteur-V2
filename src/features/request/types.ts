export type JourneyType = 'child' | 'self';

export type RequestStatus =
  | 'received'
  | 'under_review'
  | 'proposal_sent'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'contract_signed'
  | 'awaiting_payment'
  | 'payment_verified'
  | 'in_service'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export const NEED_FREQUENCY_VALUES = [
  'weekly_1',
  'weekly_2',
  'weekly_3',
  'monthly_1',
  'flexible',
] as const;

export type NeedFrequency = (typeof NEED_FREQUENCY_VALUES)[number];

export const NEED_FORMAT_VALUES = ['home', 'online', 'center'] as const;

export type NeedFormat = (typeof NEED_FORMAT_VALUES)[number];

export const TUTOR_PREFERENCE_VALUES = ['same', 'different', 'none'] as const;

export type NeedSessionMinutes = (typeof NEED_SESSION_MINUTES)[number];

export type TutorPreference = (typeof TUTOR_PREFERENCE_VALUES)[number];

export interface LearningNeed {
  readonly id: string;
  readonly requestId: string;
  readonly childId?: string;
  readonly learnerIsClient: boolean;
  readonly subject: string;
  readonly level: string;
  readonly objective: string;
  readonly frequency: NeedFrequency;
  readonly sessionMinutes: number;
  readonly availability: string;
  readonly format: NeedFormat;
  readonly location?: string;
  readonly notes?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

interface RequestRecordBase {
  readonly id: string;
  readonly reference: string;
  readonly clientId: string;
  readonly needIds: readonly [string, ...string[]];
  readonly tutorPreference: TutorPreference;
  readonly status: RequestStatus;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly submittedAt: number;
}

export interface ChildRequestRecord extends RequestRecordBase {
  readonly type: 'child';
  readonly childIds: readonly [string, ...string[]];
}

export interface AdultRequestRecord extends RequestRecordBase {
  readonly type: 'self';
  readonly childIds: readonly [];
}

export type RequestRecord = ChildRequestRecord | AdultRequestRecord;

export interface ActivityEvent {
  readonly id: string;
  readonly requestId: string;
  readonly entityType: 'request';
  readonly entityId: string;
  readonly actor: 'client';
  readonly toStatus: 'received';
  readonly createdAt: number;
}

type LearningNeedDraftFields = Omit<
  LearningNeed,
  'requestId' | 'childId' | 'learnerIsClient'
>;

export type ChildLearningNeedDraft = LearningNeedDraftFields & {
  readonly childId: string;
  readonly learnerIsClient: false;
};

export type AdultLearningNeedDraft = LearningNeedDraftFields & {
  readonly childId?: never;
  readonly learnerIsClient: true;
};

export type LearningNeedDraft = ChildLearningNeedDraft | AdultLearningNeedDraft;

export type NeedDraftOwner =
  | { readonly type: 'child'; readonly childId: string }
  | { readonly type: 'self' };

export interface NeedFormValues {
  subject: string;
  level: string;
  objective: string;
  frequency: string;
  sessionMinutes: string;
  availability: string;
  format: string;
  location: string;
  notes: string;
}

export const NEED_SESSION_MINUTES = [30, 45, 60, 90, 120] as const;

export const NEED_SUBJECT_SUGGESTIONS = [
  'mathematics',
  'french',
  'english',
  'physics',
  'chemistry',
  'science',
  'informatics',
  'examPreparation',
  'other',
] as const;

export type NeedSubjectSuggestion = (typeof NEED_SUBJECT_SUGGESTIONS)[number];

export const EMPTY_NEED_FORM_VALUES: NeedFormValues = {
  subject: '',
  level: '',
  objective: '',
  frequency: '',
  sessionMinutes: '',
  availability: '',
  format: '',
  location: '',
  notes: '',
};
