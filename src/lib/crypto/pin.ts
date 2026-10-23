import * as Crypto from 'expo-crypto';

const PIN_SALT_BYTE_LENGTH = 16;

export interface PinCredentials {
  readonly pinHash: string;
  readonly pinSalt: string;
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`,
  );
}

export async function createPinCredentials(pin: string): Promise<PinCredentials> {
  const pinSalt = Array.from(Crypto.getRandomBytes(PIN_SALT_BYTE_LENGTH))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return {
    pinHash: await hashPin(pin, pinSalt),
    pinSalt,
  };
}
