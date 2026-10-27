import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Languages,
  Monitor,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import type { TranslationKey } from '@/lib/i18n/types';

import { isoDate } from './types';

export interface OnboardingChoice {
  readonly value: string;
  readonly labelKey: TranslationKey;
  readonly icon?: LucideIcon;
}

export const TOTAL_ONBOARDING_STEPS = 4;

export const GENDER_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'boy', labelKey: 'onboarding.gender.boy' },
  { value: 'girl', labelKey: 'onboarding.gender.girl' },
];

export const GRADE_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'maternelle', labelKey: 'onboarding.grade.maternelle' },
  { value: 'p1', labelKey: 'onboarding.grade.p1' },
  { value: 'p2', labelKey: 'onboarding.grade.p2' },
  { value: 'p3', labelKey: 'onboarding.grade.p3' },
  { value: 'p4', labelKey: 'onboarding.grade.p4' },
  { value: 'p5', labelKey: 'onboarding.grade.p5' },
  { value: 'p6', labelKey: 'onboarding.grade.p6' },
  { value: 'eb7', labelKey: 'onboarding.grade.eb7' },
  { value: 'eb8', labelKey: 'onboarding.grade.eb8' },
  { value: 'h1', labelKey: 'onboarding.grade.h1' },
  { value: 'h2', labelKey: 'onboarding.grade.h2' },
  { value: 'h3', labelKey: 'onboarding.grade.h3' },
  { value: 'h4', labelKey: 'onboarding.grade.h4' },
];

export const ESTIMATED_LEVEL_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'low', labelKey: 'onboarding.level.low' },
  { value: 'intermediate', labelKey: 'onboarding.level.intermediate' },
  { value: 'satisfactory', labelKey: 'onboarding.level.satisfactory' },
  { value: 'high', labelKey: 'onboarding.level.high' },
];

export const SUBJECT_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'mathematics', labelKey: 'need.subjectOption.mathematics', icon: Calculator },
  { value: 'french', labelKey: 'need.subjectOption.french', icon: BookOpen },
  { value: 'english', labelKey: 'need.subjectOption.english', icon: Languages },
  { value: 'science', labelKey: 'need.subjectOption.science', icon: FlaskConical },
  { value: 'historyGeography', labelKey: 'need.subjectOption.historyGeography', icon: Globe },
  { value: 'informatics', labelKey: 'need.subjectOption.informatics', icon: Monitor },
];

export const GOAL_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'homework', labelKey: 'onboarding.goal.homework' },
  { value: 'exams', labelKey: 'onboarding.goal.exams' },
  { value: 'catchUp', labelKey: 'onboarding.goal.catchUp' },
  { value: 'general', labelKey: 'onboarding.goal.general' },
];

export const FREQUENCY_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'weekly_3', labelKey: 'onboarding.frequency.weekly_3' },
  { value: 'weekly_4', labelKey: 'onboarding.frequency.weekly_4' },
  { value: 'weekly_5', labelKey: 'onboarding.frequency.weekly_5' },
];

export const SESSIONS_PER_WEEK: Readonly<Record<string, number>> = {
  weekly_3: 3,
  weekly_4: 4,
  weekly_5: 5,
};

export const DAY_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'mon', labelKey: 'onboarding.day.mon' },
  { value: 'tue', labelKey: 'onboarding.day.tue' },
  { value: 'wed', labelKey: 'onboarding.day.wed' },
  { value: 'thu', labelKey: 'onboarding.day.thu' },
  { value: 'fri', labelKey: 'onboarding.day.fri' },
  { value: 'sat', labelKey: 'onboarding.day.sat' },
  { value: 'sun', labelKey: 'onboarding.day.sun' },
];

export const SLOT_OPTIONS: readonly OnboardingChoice[] = [
  { value: 'morning', labelKey: 'onboarding.slot.morning' },
  { value: 'afternoon', labelKey: 'onboarding.slot.afternoon' },
  { value: 'evening', labelKey: 'onboarding.slot.evening' },
];

export function buildBirthYears(now = new Date()): readonly string[] {
  const currentYear = now.getFullYear();
  const years: string[] = [];
  for (let year = currentYear; year >= 1900; year -= 1) {
    years.push(String(year));
  }
  return years;
}

export function buildStartDates(now = new Date()): readonly string[] {
  const dates: string[] = [];
  for (let offset = 1; offset <= 60; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    dates.push(isoDate(date));
  }
  return dates;
}

export function choiceLabel(
  choices: readonly OnboardingChoice[],
  value: string,
  translate: (key: TranslationKey) => string,
): string {
  const choice = choices.find((entry) => entry.value === value);
  return choice === undefined ? value : translate(choice.labelKey);
}
