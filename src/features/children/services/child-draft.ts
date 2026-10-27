import type { ChildDraftRecord, ChildFormValues, ChildRecord } from '../types';

export function removeChildDraft(
  children: readonly ChildDraftRecord[],
  childId: string,
): readonly ChildDraftRecord[] {
  return children.filter((child) => child.id !== childId);
}

export function childDraftToFormValues(
  child?: ChildDraftRecord,
): ChildFormValues {
  if (child === undefined) {
    return {
      firstName: '',
      lastName: '',
      yearOfBirth: '',
      level: '',
      school: '',
      notes: '',
    };
  }

  return {
    firstName: child.firstName,
    lastName: child.lastName ?? '',
    yearOfBirth: String(child.yearOfBirth),
    level: child.level,
    school: child.school ?? '',
    notes: child.notes ?? '',
  };
}

export function formValuesToChildDraft(
  values: ChildFormValues,
  id: string,
  now: number,
  createdAt = now,
): ChildDraftRecord {
  const yearOfBirth = values.yearOfBirth.trim();
  const lastName = values.lastName.trim();
  const school = values.school.trim();
  const notes = values.notes.trim();

  return {
    id,
    firstName: values.firstName.trim(),
    ...(lastName.length > 0 ? { lastName } : {}),
    yearOfBirth: Number(yearOfBirth),
    level: values.level.trim(),
    ...(school.length > 0 ? { school } : {}),
    ...(notes.length > 0 ? { notes } : {}),
    createdAt,
    updatedAt: now,
  };
}

export function childDraftToRecord(
  child: ChildDraftRecord,
  clientId: string,
): ChildRecord {
  return { ...child, clientId };
}

export function childRecordToDraft(child: ChildRecord): ChildDraftRecord {
  const { clientId: _clientId, ...draft } = child;
  return draft;
}
