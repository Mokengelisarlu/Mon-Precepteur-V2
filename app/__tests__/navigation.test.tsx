import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { useClientStore } from '@/store/client-store';
import { useRequestDraftStore } from '@/store/request-draft-store';
import { useSessionStore } from '@/store/session-store';

const existingClient = {
  id: 'cli_existing',
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  email: 'amina@example.com',
  address: 'Gombe',
  pinHash: 'hash',
  pinSalt: 'salt',
  createdAt: 100,
  updatedAt: 100,
} as const;

jest.mock('expo-crypto', () => ({
  randomUUID: jest
    .fn()
    .mockReturnValueOnce('test-child-1')
    .mockReturnValueOnce('test-child-2')
    .mockReturnValueOnce('test-adult-need')
    .mockReturnValue('test-generated-id'),
}));

async function renderApp(initialUrl?: string) {
  const result = renderRouter(undefined, initialUrl === undefined ? undefined : { initialUrl });

  await result;

  return { result };
}

describe('Navigation shell', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    useRequestDraftStore.setState({
      journeyType: null,
      contact: null,
      clientId: null,
      children: [],
      needsByChildId: {},
      selfNeeds: [],
      tutorPreference: 'none',
    });
    useClientStore.setState({ clients: [] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redirects the root path to the welcome screen', async () => {
    const { result } = await renderApp();

    expect(result.getPathnameWithParams()).toBe('/welcome');
    expect(screen.getByTestId('welcome-get-started')).toBeTruthy();
  });

  it('shows only the two entry actions on the welcome screen', async () => {
    await renderApp('/welcome');

    expect(screen.getByTestId('welcome-get-started')).toBeTruthy();
    expect(screen.getByTestId('welcome-login')).toBeTruthy();
    expect(screen.queryByTestId('admin-simulation-link')).toBeNull();
    expect(screen.queryByTestId('welcome-language-switch')).toBeNull();
  });

  it('opens the request-type sheet, routes to children, and keeps the selection on return', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(result.getPathnameWithParams()).toBe('/request-type');
    expect(screen.getByText('Who would you like a tutor for?')).toBeTruthy();
    expect(screen.getByTestId('request-type-child')).toBeTruthy();
    expect(screen.getByTestId('request-type-self')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('request-type-child'));

    expect(result.getPathnameWithParams()).toBe('/children');
    expect(useRequestDraftStore.getState().journeyType).toBe('child');

    await act(async () => {
      router.back();
    });
    await fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(result.getPathnameWithParams()).toBe('/request-type');
    expect(screen.getByTestId('request-type-child')).toBeTruthy();
    expect(useRequestDraftStore.getState().journeyType).toBe('child');
  });

  it('routes to adult needs and remembers the adult journey type', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('welcome-get-started'));
    await fireEvent.press(screen.getByTestId('request-type-self'));

    expect(result.getPathnameWithParams()).toBe('/needs/self');
    expect(useRequestDraftStore.getState().journeyType).toBe('self');
  });

  it('redirects adult needs when the selected journey is not for the adult', async () => {
    const { result } = await renderApp('/needs/self');

    expect(result.getPathnameWithParams()).toBe('/request-type');
    expect(screen.getByTestId('request-type-sheet')).toBeTruthy();
  });

  it('dismisses the request-type sheet with back navigation', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('welcome-get-started'));

    expect(result.getPathnameWithParams()).toBe('/request-type');
    expect(screen.getByTestId('request-type-sheet')).toBeTruthy();

    await act(async () => {
      router.back();
    });

    expect(result.getPathnameWithParams()).toBe('/welcome');
    expect(screen.queryByTestId('request-type-sheet')).toBeNull();
  });

  it('adds, edits, and removes children through the parent journey', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('welcome-get-started'));
    await fireEvent.press(screen.getByTestId('request-type-child'));
    expect(result.getPathnameWithParams()).toBe('/children');
    expect(screen.getByTestId('children-empty-state')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('children-empty-add'));
    await fireEvent.changeText(screen.getByTestId('child-first-name'), 'Amina');
    await fireEvent.changeText(
      screen.getByTestId('child-year-of-birth'),
      String(new Date().getFullYear() - 10),
    );
    await fireEvent.press(screen.getByTestId('child-level'));
    await fireEvent.press(screen.getByText('Primary · P4'));
    await fireEvent.press(screen.getByTestId('child-save'));

    expect(result.getPathnameWithParams()).toBe('/children');
    expect(useRequestDraftStore.getState().children).toHaveLength(1);
    const firstChild = useRequestDraftStore.getState().children[0];
    expect(firstChild?.firstName).toBe('Amina');

    await fireEvent.press(screen.getByTestId('children-add'));
    await fireEvent.changeText(screen.getByTestId('child-first-name'), 'David');
    await fireEvent.changeText(
      screen.getByTestId('child-year-of-birth'),
      String(new Date().getFullYear() - 12),
    );
    await fireEvent.press(screen.getByTestId('child-level'));
    await fireEvent.press(screen.getByText('Secondary · 6e'));
    await fireEvent.press(screen.getByTestId('child-save'));

    expect(useRequestDraftStore.getState().children).toHaveLength(2);

    if (firstChild === undefined) {
      throw new Error('The first child should have been saved.');
    }
    await fireEvent.press(screen.getByTestId(`child-edit-${firstChild.id}`));
    await fireEvent.changeText(screen.getByTestId('child-first-name'), 'Amina Rose');
    await fireEvent.press(screen.getByTestId('child-save'));

    expect(useRequestDraftStore.getState().children).toHaveLength(2);
    expect(
      useRequestDraftStore.getState().children.find((child) => child.id === firstChild.id)?.firstName,
    ).toBe('Amina Rose');

    await fireEvent.press(screen.getByTestId(`child-remove-${firstChild.id}`));
    await fireEvent.press(screen.getByText('Remove'));

    expect(useRequestDraftStore.getState().children).toHaveLength(1);

    const remainingChild = useRequestDraftStore.getState().children[0];
    if (remainingChild === undefined) {
      throw new Error('The remaining child should have been saved.');
    }
    await fireEvent.press(screen.getByTestId('children-continue'));

    expect(result.getPathnameWithParams()).toBe(`/needs/child/${remainingChild.id}`);
  });

  it('captures an adult need without creating a child and continues to contact details', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('welcome-get-started'));
    await fireEvent.press(screen.getByTestId('request-type-self'));

    expect(result.getPathnameWithParams()).toBe('/needs/self');
    expect(screen.getByTestId('adult-needs-screen')).toBeTruthy();
    expect(screen.getByTestId('adult-needs-continue').props.accessibilityState.disabled).toBe(
      true,
    );

    await fireEvent.press(screen.getByTestId('need-empty-add'));
    await fireEvent.press(screen.getByTestId('need-subject-suggestion-mathematics'));
    await fireEvent.changeText(screen.getByTestId('need-level'), 'Beginner');
    await fireEvent.changeText(screen.getByTestId('need-objective'), 'Build confidence');
    await fireEvent.press(screen.getByTestId('need-frequency'));
    await fireEvent.press(screen.getByText('Twice a week'));
    await fireEvent.press(screen.getByTestId('need-session-minutes'));
    await fireEvent.press(screen.getByText('45 minutes'));
    await fireEvent.changeText(screen.getByTestId('need-availability'), 'Weekday evenings');
    await fireEvent.press(screen.getByText('Online'));
    await fireEvent.press(screen.getByTestId('need-save'));

    const draft = useRequestDraftStore.getState();
    expect(draft.children).toEqual([]);
    expect(draft.selfNeeds).toHaveLength(1);
    expect(draft.selfNeeds[0]).toMatchObject({
      learnerIsClient: true,
      subject: 'Mathematics',
    });
    expect(draft.selfNeeds[0]).not.toHaveProperty('childId');

    await fireEvent.press(screen.getByTestId('adult-needs-continue'));

    expect(result.getPathnameWithParams()).toMatch(/^\/contact(?:\?|$)/);
    expect(screen.getByTestId('contact-screen')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('contact-back'));
    expect(result.getPathnameWithParams()).toBe('/needs/self');
  });

  it('visits each child needs screen in order before continuing to contact details', async () => {
    const firstChild = {
      id: 'chd_child1',
      firstName: 'Amina',
      yearOfBirth: new Date().getFullYear() - 10,
      level: 'P4',
      createdAt: 100,
      updatedAt: 100,
    } as const;
    const secondChild = {
      id: 'chd_child2',
      firstName: 'David',
      yearOfBirth: new Date().getFullYear() - 12,
      level: '6e',
      createdAt: 200,
      updatedAt: 200,
    } as const;
    const firstNeed = {
      id: 'ned_need1',
      childId: firstChild.id,
      learnerIsClient: false,
      subject: 'Mathematics',
      level: firstChild.level,
      objective: 'Build confidence with fractions',
      frequency: 'weekly_2',
      sessionMinutes: 45,
      availability: 'Tuesday after 4 pm',
      format: 'online',
      createdAt: 100,
      updatedAt: 100,
    } as const;
    const secondNeed = {
      ...firstNeed,
      id: 'ned_need2',
      childId: secondChild.id,
      subject: 'French',
    } as const;
    useRequestDraftStore.setState({
      journeyType: 'child',
      children: [firstChild, secondChild],
      needsByChildId: {
        [firstChild.id]: [firstNeed],
        [secondChild.id]: [secondNeed],
      },
    });

    const { result } = await renderApp(`/needs/child/${firstChild.id}`);
    expect(screen.getByText('What does Amina need?')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('child-needs-continue'));
    expect(result.getPathnameWithParams()).toBe(`/needs/child/${secondChild.id}`);
    expect(screen.getByText('What does David need?')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('child-needs-continue'));
    expect(result.getPathnameWithParams()).toMatch(/^\/contact(?:\?|$)/);
    expect(screen.getByTestId('contact-screen')).toBeTruthy();
  });

  it('continues with an existing client without creating a duplicate profile', async () => {
    useRequestDraftStore.setState({ journeyType: 'self' });
    useClientStore.setState({ clients: [existingClient] });
    const { result } = await renderApp('/contact');

    await fireEvent.changeText(screen.getByTestId('contact-first-name'), 'Amina');
    await fireEvent.changeText(screen.getByTestId('contact-last-name'), 'Kabila');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), '0812345678');
    await fireEvent.press(screen.getByTestId('contact-continue'));

    expect(screen.getByTestId('contact-duplicate-sheet')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('contact-duplicate-continue'));

    expect(result.getPathnameWithParams()).toBe('/pin');
    expect(useRequestDraftStore.getState()).toMatchObject({
      clientId: existingClient.id,
      contact: {
        firstName: existingClient.firstName,
        lastName: existingClient.lastName,
        phone: existingClient.phone,
        email: existingClient.email,
        address: existingClient.address,
      },
    });
    expect(useClientStore.getState().clients).toEqual([existingClient]);
  });

  it('opens the login-unavailable screen from Welcome and returns home', async () => {
    const { result } = await renderApp('/welcome');

    await fireEvent.press(screen.getByTestId('welcome-login'));

    expect(result.getPathnameWithParams()).toBe('/login');
    expect(screen.getByTestId('login-unavailable-screen')).toBeTruthy();
    expect(screen.getByText('Login is not available in this local prototype yet.')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('login-back-home'));

    expect(result.getPathnameWithParams()).toBe('/welcome');
    expect(screen.getByTestId('welcome-get-started')).toBeTruthy();
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
