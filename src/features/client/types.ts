export interface ContactFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  commune: string;
  quartier: string;
  avenue: string;
  number: string;
}

export interface ClientContactDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email?: string;
  readonly address?: string;
  readonly city?: string;
  readonly commune?: string;
  readonly quartier?: string;
  readonly avenue?: string;
  readonly number?: string;
}

export interface ClientProfile extends ClientContactDetails {
  readonly id: string;
  readonly pinHash: string;
  readonly pinSalt: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export const EMPTY_CONTACT_FORM_VALUES: ContactFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  city: 'Lubumbashi',
  commune: '',
  quartier: '',
  avenue: '',
  number: '',
};
