import {
  createEmptyChildOnboardingData,
  type ChildDraftRecord,
  type ChildOnboardingData,
} from '../types';
import { formValuesToChildDraft } from './child-draft';

const GRADE_TO_LEVEL: Readonly<Record<string, string>> = {
  maternelle: 'Maternelle',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
  p5: 'P5',
  p6: 'P6',
  eb7: '7e',
  eb8: '8e',
  h1: '1re',
  h2: '2e',
  h3: '3e',
  h4: '4e',
};

const LEVEL_TO_GRADE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(GRADE_TO_LEVEL).map(([grade, level]) => [level, grade]),
);

export function buildChildDraftFromOnboarding(
  data: ChildOnboardingData,
  id: string,
  now: number,
  createdAt = now,
): ChildDraftRecord {
  const level = GRADE_TO_LEVEL[data.grade] ?? data.grade;
  const draft = formValuesToChildDraft(
    {
      firstName: data.firstName,
      lastName: data.lastName,
      yearOfBirth: data.birthYear,
      level,
      school: data.school,
      notes: data.notes,
    },
    id,
    now,
    createdAt,
  );

  return {
    ...draft,
    ...(data.gender.length > 0 ? { gender: data.gender } : {}),
    ...(data.estimatedLevel.length > 0 ? { estimatedLevel: data.estimatedLevel } : {}),
  };
}

export function childToOnboardingData(
  child?: ChildDraftRecord,
  saved?: ChildOnboardingData,
): ChildOnboardingData {
  if (saved !== undefined) {
    return { ...createEmptyChildOnboardingData(), ...saved };
  }

  if (child === undefined) {
    return createEmptyChildOnboardingData();
  }

  return {
    ...createEmptyChildOnboardingData(),
    firstName: child.firstName,
    lastName: child.lastName ?? '',
    birthYear: String(child.yearOfBirth),
    grade: LEVEL_TO_GRADE[child.level] ?? child.level,
    school: child.school ?? '',
    notes: child.notes ?? '',
    gender: child.gender ?? '',
    estimatedLevel: child.estimatedLevel ?? '',
  };
}
