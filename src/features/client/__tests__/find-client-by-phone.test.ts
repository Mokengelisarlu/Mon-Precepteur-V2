import { findClientByPhone } from '../services/find-client-by-phone';
import type { ClientProfile } from '../types';

const client: ClientProfile = {
  id: 'cli_client1',
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  pinHash: 'hash',
  pinSalt: 'salt',
  createdAt: 100,
  updatedAt: 100,
};

describe('findClientByPhone', () => {
  it('returns the existing client with a matching normalized phone', () => {
    expect(findClientByPhone([client], '+243812345678')).toBe(client);
  });

  it('does not match a different phone number', () => {
    expect(findClientByPhone([client], '+243899999999')).toBeUndefined();
  });
});
