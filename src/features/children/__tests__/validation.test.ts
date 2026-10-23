import { ageFromBirthYear, childFormSchema } from '../validation';

const validChild = {
  firstName: 'Amina',
  lastName: '',
  yearOfBirth: String(new Date().getFullYear() - 10),
  level: 'P4',
  school: '',
  notes: '',
};

describe('childFormSchema', () => {
  it('accepts a valid child with a year of birth', () => {
    expect(childFormSchema.safeParse(validChild).success).toBe(true);
  });

  it('derives an age from the birth year using the current calendar year', () => {
    expect(ageFromBirthYear(2016, 2026)).toBe(10);
  });

  it('rejects a missing first name and school level', () => {
    const result = childFormSchema.safeParse({
      ...validChild,
      firstName: '',
      level: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'validation.child.firstName',
          'validation.child.level',
        ]),
      );
    }
  });

  it.each([
    String(new Date().getFullYear() - 2),
    String(new Date().getFullYear() - 26),
    String(new Date().getFullYear() + 1),
    '20xx',
    '',
  ])('rejects invalid year of birth %s', (yearOfBirth) => {
    const result = childFormSchema.safeParse({ ...validChild, yearOfBirth });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === 'validation.child.yearOfBirth'),
      ).toBe(true);
    }
  });

  it('enforces the optional field length limits', () => {
    const result = childFormSchema.safeParse({
      ...validChild,
      lastName: 'x'.repeat(61),
      school: 'x'.repeat(81),
      notes: 'x'.repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'validation.child.lastName',
          'validation.child.school',
          'validation.child.notes',
        ]),
      );
    }
  });
});
