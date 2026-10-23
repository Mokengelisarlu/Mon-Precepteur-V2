import { z } from 'zod';

import { NEED_FORMAT_VALUES, NEED_FREQUENCY_VALUES, NEED_SESSION_MINUTES } from './types';

const needFormFields = {
  subject: z.string().trim().min(2, 'validation.need.subject').max(80, 'validation.need.subject'),
  level: z.string().trim().min(1, 'validation.need.level').max(60, 'validation.need.level'),
  objective: z
    .string()
    .trim()
    .min(5, 'validation.need.objective')
    .max(400, 'validation.need.objective'),
  frequency: z.string().pipe(
    z.enum(NEED_FREQUENCY_VALUES, {
      error: 'validation.need.frequency',
    }),
  ),
  sessionMinutes: z
    .string()
    .transform(Number)
    .pipe(z.literal(NEED_SESSION_MINUTES, 'validation.need.sessionMinutes')),
  availability: z
    .string()
    .trim()
    .min(5, 'validation.need.availability')
    .max(300, 'validation.need.availability'),
  format: z.string().pipe(
    z.enum(NEED_FORMAT_VALUES, {
      error: 'validation.need.format',
    }),
  ),
  location: z.string().trim().max(120, 'validation.need.location'),
  notes: z.string().trim().max(500, 'validation.need.notes'),
};

export const needFormSchema = z.object(needFormFields).superRefine((values, context) => {
  if (values.format !== 'online' && values.location.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['location'],
      message: 'validation.need.location',
    });
  }
});

export type ValidNeedFormValues = z.infer<typeof needFormSchema>;
