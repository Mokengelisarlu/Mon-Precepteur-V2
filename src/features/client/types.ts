export interface ContactFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

export interface ClientContactDetails {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email?: string;
  readonly address?: string;
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
  address: '',
};
