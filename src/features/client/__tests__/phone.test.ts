import { normalizeDrcPhoneNumber } from '../lib/phone';

describe('normalizeDrcPhoneNumber', () => {
  it.each([
    ['+243 812 345 678', '+243812345678'],
    ['+243 974 123 456', '+243974123456'],
    ['0812345678', '+243812345678'],
    ['0974123456', '+243974123456'],
    ['812345678', '+243812345678'],
    ['+243 (0) 81 234 5678', null],
    ['+243 812 345 67', null],
    ['08123456789', null],
    ['+250 812 345 678', null],
    ['81A345678', null],
    ['', null],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeDrcPhoneNumber(input)).toBe(expected);
  });
});
