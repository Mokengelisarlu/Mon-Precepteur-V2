const PHONE_SEPARATORS = /[\s().-]/g;

export function normalizeDrcPhoneNumber(value: string): string | null {
  const compact = value.trim().replace(PHONE_SEPARATORS, '');
  if (!/^\+?\d+$/.test(compact)) {
    return null;
  }

  let nationalNumber: string;
  if (compact.startsWith('+243')) {
    nationalNumber = compact.slice(4);
  } else if (compact.startsWith('0')) {
    nationalNumber = compact.slice(1);
  } else if (/^8\d{8}$/.test(compact)) {
    nationalNumber = compact;
  } else {
    return null;
  }

  if (!/^\d{9}$/.test(nationalNumber)) {
    return null;
  }

  return `+243${nationalNumber}`;
}
