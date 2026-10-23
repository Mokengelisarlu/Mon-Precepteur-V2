import type { TranslationKey } from '@/lib/i18n/types';

import type {
  NEED_FORMAT_VALUES,
  NEED_FREQUENCY_VALUES,
  NEED_SUBJECT_SUGGESTIONS,
  TUTOR_PREFERENCE_VALUES,
  TutorPreference,
} from '../types';

export const NEED_FREQUENCY_LABEL_KEYS = {
  weekly_1: 'need.frequency.weekly_1',
  weekly_2: 'need.frequency.weekly_2',
  weekly_3: 'need.frequency.weekly_3',
  monthly_1: 'need.frequency.monthly_1',
  flexible: 'need.frequency.flexible',
} as const satisfies Record<(typeof NEED_FREQUENCY_VALUES)[number], TranslationKey>;

export const NEED_FORMAT_LABEL_KEYS = {
  home: 'need.format.home',
  online: 'need.format.online',
  center: 'need.format.center',
} as const satisfies Record<(typeof NEED_FORMAT_VALUES)[number], TranslationKey>;

export const NEED_SUBJECT_LABEL_KEYS = {
  mathematics: 'need.subjectOption.mathematics',
  french: 'need.subjectOption.french',
  english: 'need.subjectOption.english',
  physics: 'need.subjectOption.physics',
  chemistry: 'need.subjectOption.chemistry',
  science: 'need.subjectOption.science',
  informatics: 'need.subjectOption.informatics',
  examPreparation: 'need.subjectOption.examPreparation',
  other: 'need.subjectOption.other',
} as const satisfies Record<(typeof NEED_SUBJECT_SUGGESTIONS)[number], TranslationKey>;

export const TUTOR_PREFERENCE_LABEL_KEYS = {
  same: 'need.tutorPreference.same',
  different: 'need.tutorPreference.different',
  none: 'need.tutorPreference.none',
} as const satisfies Record<TutorPreference, TranslationKey> &
  Record<(typeof TUTOR_PREFERENCE_VALUES)[number], TranslationKey>;
