import { needFormSchema } from '../validation';

const validNeed = {
  subject: 'Mathematics',
  level: 'P4',
  objective: 'Build confidence with fractions',
  frequency: 'weekly_2',
  sessionMinutes: '45',
  availability: 'Tuesday and Thursday after 4 pm',
  format: 'online',
  location: '',
  notes: '',
};

describe('needFormSchema', () => {
  it('accepts an online need without a location and converts session length to a number', () => {
    const result = needFormSchema.safeParse(validNeed);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sessionMinutes).toBe(45);
      expect(result.data.frequency).toBe('weekly_2');
    }
  });

  it.each(['home', 'center'])('requires a location for %s sessions', (format) => {
    const result = needFormSchema.safeParse({ ...validNeed, format });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === 'location' && issue.message === 'validation.need.location',
        ),
      ).toBe(true);
    }
  });

  it('accepts a location for in-person sessions and permits an optional location online', () => {
    expect(
      needFormSchema.safeParse({
        ...validNeed,
        format: 'home',
        location: 'Gombe, Kinshasa',
      }).success,
    ).toBe(true);
    expect(
      needFormSchema.safeParse({
        ...validNeed,
        location: 'Optional online meeting location',
      }).success,
    ).toBe(true);
  });

  it('rejects missing required fields and unsupported option values', () => {
    const result = needFormSchema.safeParse({
      ...validNeed,
      subject: ' ',
      objective: 'Nope',
      frequency: 'daily',
      sessionMinutes: '75',
      format: 'hybrid',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'validation.need.subject',
          'validation.need.objective',
          'validation.need.frequency',
          'validation.need.sessionMinutes',
          'validation.need.format',
        ]),
      );
    }
  });
});
