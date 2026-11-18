import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import type { ClientProfile } from '@/features/client/types';
import { hashPin } from '@/lib/crypto/pin';
import { useClientStore } from '@/store/client-store';
import { useRequestDraftStore } from '@/store/request-draft-store';
import { useSessionStore } from '@/store/session-store';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  randomUUID: jest.fn(() => 'test-id'),
  getRandomBytes: jest.fn((byteCount: number) => new Uint8Array(byteCount).fill(42)),
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => {
    const hash = Array.from(value).reduce(
      (result, character) => Math.imul(result ^ character.charCodeAt(0), 16777619),
      2166136261,
    );
    return (hash >>> 0).toString(16).padStart(8, '0');
  }),
}));

const contact = {
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
};

const clientId = 'cli_pin_test';
const existingSalt = 'ab'.repeat(16);

describe('PIN route', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    useRequestDraftStore.setState({
      journeyType: 'self',
      contact,
      clientId,
      children: [],
      onboardingByChildId: {},
      selfNeeds: [],
      tutorPreference: 'none',
    });
    useClientStore.setState({ clients: [] });
  });

  it('creates a client with only the salted PIN hash and advances to review', async () => {
    const result = renderRouter(undefined, { initialUrl: '/pin' });
    await result;

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '482659');
    await fireEvent.changeText(screen.getByTestId('pin-confirm'), '482659');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    await waitFor(() => expect(result.getPathnameWithParams()).toBe('/review'));

    const client = useClientStore.getState().clients[0];
    expect(client).toMatchObject({
      id: clientId,
      ...contact,
      pinSalt: '2a'.repeat(16),
    });
    expect(client?.pinHash).toBe(await hashPin('482659', '2a'.repeat(16)));
    expect(
      JSON.stringify({
        client: useClientStore.getState(),
        draft: useRequestDraftStore.getState(),
      }),
    ).not.toContain('482659');
  });

  it('verifies an existing client PIN without replacing its profile credentials', async () => {
    const existingClient: ClientProfile = {
      id: clientId,
      ...contact,
      pinSalt: existingSalt,
      pinHash: await hashPin('135792', existingSalt),
      createdAt: 100,
      updatedAt: 100,
    };
    useClientStore.setState({ clients: [existingClient] });

    const result = renderRouter(undefined, { initialUrl: '/pin' });
    await result;

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '000000');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    expect(await screen.findByText('That code does not match this profile')).toBeTruthy();
    expect(result.getPathnameWithParams()).toBe('/pin');
    expect(useClientStore.getState().clients[0]).toEqual(existingClient);

    await fireEvent.changeText(screen.getByTestId('pin-entry'), '135792');
    await fireEvent.press(screen.getByTestId('pin-continue'));

    await waitFor(() => expect(result.getPathnameWithParams()).toBe('/review'));
    expect(useClientStore.getState().clients[0]).toEqual(existingClient);
  });
});
