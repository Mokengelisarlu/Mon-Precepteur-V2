export interface ChildRecord {
  readonly id: string;
  readonly clientId: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly yearOfBirth: number;
  readonly level: string;
  readonly school?: string;
  readonly notes?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export type ChildDraftRecord = Omit<ChildRecord, 'clientId'>;

export interface ChildFormValues {
  firstName: string;
  lastName: string;
  yearOfBirth: string;
  level: string;
  school: string;
  notes: string;
}

export const EMPTY_CHILD_FORM_VALUES: ChildFormValues = {
  firstName: '',
  lastName: '',
  yearOfBirth: '',
  level: '',
  school: '',
  notes: '',
};

export const CHILD_LEVEL_VALUES = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  '1re',
  '2e',
  '3e',
  '4e',
  '5e',
  '6e',
  'other',
] as const;

export type ChildLevelValue = (typeof CHILD_LEVEL_VALUES)[number];
