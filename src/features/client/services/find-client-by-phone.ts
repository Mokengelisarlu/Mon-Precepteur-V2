import type { ClientProfile } from '../types';

export function findClientByPhone(
  clients: readonly ClientProfile[],
  normalizedPhone: string,
): ClientProfile | undefined {
  return clients.find((client) => client.phone === normalizedPhone);
}
