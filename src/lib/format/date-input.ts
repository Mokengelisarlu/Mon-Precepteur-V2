export type DateInput = Date | string | number;

export function toDate(input: DateInput): Date | null {
  const date = input instanceof Date ? input : new Date(input);

  return Number.isNaN(date.getTime()) ? null : date;
}
