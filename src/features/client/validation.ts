import { z } from 'zod';

import { normalizeDrcPhoneNumber } from './lib/phone';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_PATTERN = /^\d{4}$/;

const pinFieldsSchema = z.object({
  pin: z.string().regex(PIN_PATTERN, 'validation.pin.format'),
  pinConfirm: z.string(),
});

export const pinFormSchema = pinFieldsSchema.superRefine((values, context) => {
  if (!PIN_PATTERN.test(values.pinConfirm)) {
    context.addIssue({
      code: 'custom',
      path: ['pinConfirm'],
      message: 'validation.pin.format',
    });
  } else if (values.pin !== values.pinConfirm) {
    context.addIssue({
      code: 'custom',
      path: ['pinConfirm'],
      message: 'validation.pin.mismatch',
    });
  }
});

export const pinVerificationSchema = pinFieldsSchema;

export type PinFormValues = z.infer<typeof pinFieldsSchema>;

export const contactFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'validation.contact.firstName')
      .max(60, 'validation.contact.firstName'),
    lastName: z
      .string()
      .trim()
      .min(1, 'validation.contact.lastName')
      .max(60, 'validation.contact.lastName'),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => normalizeDrcPhoneNumber(value) !== null,
        'validation.contact.phone',
      )
      .transform((value) => normalizeDrcPhoneNumber(value) ?? ''),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || EMAIL_PATTERN.test(value),
        'validation.contact.email',
      ),
    address: z.string().trim().max(120, 'validation.contact.address'),
  })
  .transform(({ email, address, ...details }) => ({
    ...details,
    ...(email.length > 0 ? { email } : {}),
    ...(address.length > 0 ? { address } : {}),
  }));

export type ValidContactDetails = z.output<typeof contactFormSchema>;
