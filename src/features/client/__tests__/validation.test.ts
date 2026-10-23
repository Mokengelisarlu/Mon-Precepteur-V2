import { contactFormSchema, pinFormSchema, pinVerificationSchema } from '../validation';

const validForm = {
  firstName: '  Amina ',
  lastName: ' Kabila ',
  phone: '0812345678',
  email: '',
  address: ' Gombe ',
};

describe('contactFormSchema', () => {
  it('trims contact fields and stores the normalized phone number', () => {
    expect(contactFormSchema.parse(validForm)).toEqual({
      firstName: 'Amina',
      lastName: 'Kabila',
      phone: '+243812345678',
      address: 'Gombe',
    });
  });

  describe('pinFormSchema', () => {
    const validPin = { pin: '4826', pinConfirm: '4826' };

    it('accepts matching four-digit PINs', () => {
      expect(pinFormSchema.safeParse(validPin).success).toBe(true);
    });

    it.each([
      { pin: '123', pinConfirm: '123' },
      { pin: '12a4', pinConfirm: '12a4' },
      { pin: '4826', pinConfirm: '482' },
      { pin: '4826', pinConfirm: '4827' },
    ])('rejects an invalid PIN entry or confirmation', (values) => {
      expect(pinFormSchema.safeParse(values).success).toBe(false);
    });

    it('validates the four-digit PIN when confirming an existing profile', () => {
      expect(pinVerificationSchema.safeParse({ pin: '4826', pinConfirm: '' }).success).toBe(true);
      expect(pinVerificationSchema.safeParse({ pin: '482', pinConfirm: '' }).success).toBe(false);
    });
  });

  it('accepts an empty email address', () => {
    expect(contactFormSchema.safeParse({ ...validForm, email: '' }).success).toBe(true);
  });

  it('rejects an invalid non-empty email address', () => {
    const result = contactFormSchema.safeParse({ ...validForm, email: 'not-an-email' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('validation.contact.email');
    }
  });

  it('requires a valid phone and bounds the optional address', () => {
    const invalidPhone = contactFormSchema.safeParse({ ...validForm, phone: '12345' });
    const invalidAddress = contactFormSchema.safeParse({
      ...validForm,
      address: 'a'.repeat(121),
    });

    expect(invalidPhone.success).toBe(false);
    expect(invalidAddress.success).toBe(false);
  });
});
