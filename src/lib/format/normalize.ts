const NON_BREAKING_SPACES = /[\u00a0\u202f]/g;

export function normalizeSpaces(value: string): string {
  return value.replace(NON_BREAKING_SPACES, ' ');
}
