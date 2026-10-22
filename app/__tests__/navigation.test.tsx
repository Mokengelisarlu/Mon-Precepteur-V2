import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { useSessionStore } from '@/store/session-store';

async function renderApp(initialUrl?: string) {
  const result = renderRouter(undefined, initialUrl === undefined ? undefined : { initialUrl });

  await result;

  return { result };
}

describe('Navigation shell', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
  });

  it('redirects the root path to the welcome screen', async () => {
    const { result } = await renderApp();

    expect(result.getPathnameWithParams()).toBe('/welcome');
    expect(screen.getByTestId('welcome-get-started')).toBeTruthy();
  });

  it('exposes the admin simulation from the welcome screen', async () => {
    await renderApp('/welcome');

    expect(screen.getByText('Administration (simulation)')).toBeTruthy();
    expect(screen.getAllByText(/Simulation/).length).toBeGreaterThan(0);
  });

  it('opens the admin simulation from the welcome screen', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('admin-simulation-link'));

    expect(result.getPathnameWithParams()).toBe('/admin');
    expect(screen.getByText('/admin')).toBeTruthy();
  });

  it('labels the admin workspace as a simulation', async () => {
    await renderApp('/admin');

    expect(screen.getByTestId('admin-simulation-banner')).toBeTruthy();
    expect(screen.getByText(/Simulation/)).toBeTruthy();
  });

  it('renders the not-found state for an unknown route', async () => {
    await renderApp('/unknown-route');

    expect(screen.getByTestId('not-found-state')).toBeTruthy();
  });

  it('renders the not-found state for a malformed dynamic id', async () => {
    await renderApp('/proposal/not-an-id');

    expect(screen.getByTestId('not-found-state')).toBeTruthy();
  });

  it('renders the screen placeholder for a valid dynamic id', async () => {
    await renderApp('/proposal/prp_1234');

    expect(screen.getByText('/proposal/prp_1234')).toBeTruthy();
  });

  it('returns to the dashboard from the not-found state', async () => {
    await renderApp('/proposal/not-an-id');

    await fireEvent.press(screen.getByText('Back to the dashboard'));

    expect(screen.getByText('/dashboard')).toBeTruthy();
    expect(screen.queryByTestId('not-found-state')).toBeNull();
  });

  it('returns to the welcome screen from the unknown-route state', async () => {
    const { result } = await renderApp('/unknown-route');

    await fireEvent.press(screen.getByText('Back home'));

    expect(result.getPathnameWithParams()).toBe('/welcome');
  });

  it('goes back to the previous screen with the system back action', async () => {
    const { result } = await renderApp('/welcome');

    await act(async () => {
      router.push('/dashboard');
    });
    await act(async () => {
      router.back();
    });

    expect(result.getPathnameWithParams()).toBe('/welcome');
  });
});
