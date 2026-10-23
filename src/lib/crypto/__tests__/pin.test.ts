import { createPinCredentials, hashPin } from '../pin';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  getRandomBytes: jest.fn((byteCount: number) => new Uint8Array(byteCount).fill(31)),
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => {
    const hash = Array.from(value).reduce(
      (result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619),
      2166136261,
    );
    return (hash >>> 0).toString(16).padStart(8, '0');
  }),
}));

describe('PIN cryptography', () => {
  it('produces the same hash for the same PIN and salt', async () => {
    const firstHash = await hashPin('4826', 'a'.repeat(32));
    const secondHash = await hashPin('4826', 'a'.repeat(32));

    expect(firstHash).toBe(secondHash);
  });

  it('produces different hashes for different PINs or salts', async () => {
    const original = await hashPin('4826', 'a'.repeat(32));

    await expect(hashPin('4827', 'a'.repeat(32))).resolves.not.toBe(original);
    await expect(hashPin('4826', 'b'.repeat(32))).resolves.not.toBe(original);
  });

  it('generates a 16-byte salt and stores only its hash and salt', async () => {
    const credentials = await createPinCredentials('4826');

    expect(credentials.pinSalt).toBe('1f'.repeat(16));
    expect(credentials.pinHash).not.toContain('4826');
    expect(credentials).not.toHaveProperty('pin');
  });
});
