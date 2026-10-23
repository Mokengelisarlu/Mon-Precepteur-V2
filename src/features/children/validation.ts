import { z } from 'zod';

const MIN_CHILD_AGE = 3;
const MAX_CHILD_AGE = 25;

export function ageFromBirthYear(
  yearOfBirth: number,
  currentYear = new Date().getFullYear(),
): number {
  return currentYear - yearOfBirth;
}

function isValidYearOfBirth(value: string): boolean {
  if (!/^\d{4}$/.test(value)) {
    return false;
  }

  const age = ageFromBirthYear(Number(value));
  return age >= MIN_CHILD_AGE && age <= MAX_CHILD_AGE;
}

export const childFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'validation.child.firstName')
      .max(60, 'validation.child.firstName')
      .refine((value) => /\p{L}/u.test(value), 'validation.child.firstName'),
    lastName: z.string().trim().max(60, 'validation.child.lastName'),
    yearOfBirth: z
      .string()
      .trim()
      .refine(isValidYearOfBirth, 'validation.child.yearOfBirth'),
    level: z.string().trim().min(1, 'validation.child.level').max(60, 'validation.child.level'),
    school: z.string().trim().max(80, 'validation.child.school'),
    notes: z.string().trim().max(500, 'validation.child.notes'),
  });

export type ValidChildFormValues = z.infer<typeof childFormSchema>;
