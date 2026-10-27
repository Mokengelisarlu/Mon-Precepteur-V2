import type {
  AdultLearningNeedDraft,
  LearningNeedDraft,
  NeedFormValues,
} from '../types';
import type { ValidNeedFormValues } from '../validation';

export function needDraftToFormValues(need?: LearningNeedDraft): NeedFormValues {
  if (need === undefined) {
    return {
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
  }

  return {
    subject: need.subject,
    level: need.level,
    objective: need.objective,
    frequency: need.frequency,
    sessionMinutes: String(need.sessionMinutes),
    availability: need.availability,
    format: need.format,
    location: need.location ?? '',
    notes: need.notes ?? '',
  };
}

export function formValuesToNeedDraft(
  values: ValidNeedFormValues,
  id: string,
  now: number,
  createdAt?: number,
): AdultLearningNeedDraft;
export function formValuesToNeedDraft(
  values: ValidNeedFormValues,
  id: string,
  now: number,
  createdAt = now,
): LearningNeedDraft {
  const location = values.location.trim();
  const notes = values.notes.trim();
  const commonFields = {
    id,
    subject: values.subject.trim(),
    level: values.level.trim(),
    objective: values.objective.trim(),
    frequency: values.frequency,
    sessionMinutes: values.sessionMinutes,
    availability: values.availability.trim(),
    format: values.format,
    ...(location.length > 0 ? { location } : {}),
    ...(notes.length > 0 ? { notes } : {}),
    createdAt,
    updatedAt: now,
  };

  return { ...commonFields, learnerIsClient: true };
}

export function upsertNeedDraft<TNeed extends LearningNeedDraft>(
  needs: readonly TNeed[],
  need: TNeed,
): readonly TNeed[] {
  const existingIndex = needs.findIndex((entry) => entry.id === need.id);
  if (existingIndex === -1) {
    return [...needs, need];
  }

  return needs.map((entry) => (entry.id === need.id ? need : entry));
}

export function removeNeedDraft<TNeed extends LearningNeedDraft>(
  needs: readonly TNeed[],
  needId: string,
): readonly TNeed[] {
  return needs.filter((need) => need.id !== needId);
}
