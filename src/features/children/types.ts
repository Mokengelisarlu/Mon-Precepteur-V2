export interface ChildRecord {
  readonly id: string;
  readonly clientId: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly yearOfBirth: number;
  readonly level: string;
  readonly school?: string;
  readonly notes?: string;
  readonly gender?: string;
  readonly estimatedLevel?: string;
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

export interface ChildOnboardingData {
  readonly lastName: string;
  readonly firstName: string;
  readonly birthYear: string;
  readonly gender: string;
  readonly grade: string;
  readonly school: string;
  readonly estimatedLevel: string;
  readonly subjects: readonly string[];
  readonly otherSubject: string;
  readonly goals: readonly string[];
  readonly notes: string;
  readonly startDate: string;
  readonly frequency: string;
  readonly days: readonly string[];
  readonly slots: readonly string[];
}

export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createEmptyChildOnboardingData(now = new Date()): ChildOnboardingData {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  return {
    lastName: '',
    firstName: '',
    birthYear: '',
    gender: '',
    grade: '',
    school: '',
    estimatedLevel: '',
    subjects: [],
    otherSubject: '',
    goals: [],
    notes: '',
    startDate: isoDate(start),
    frequency: 'weekly_3',
    days: [],
    slots: [],
  };
}
