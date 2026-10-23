import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ChildDraftRecord } from '@/features/children';
import type { ClientProfile } from '@/features/client';
import type { ChildLearningNeedDraft } from '@/features/request/types';

import ReviewRoute from '../../../../app/(client)/review';
import { useActivityStore } from '@/store/activity-store';
import { useChildStore } from '@/store/child-store';
import { useClientStore } from '@/store/client-store';
import { useDomainStore } from '@/store/domain-store';
import { useNotificationStore } from '@/store/notification-store';
import { useRequestDraftStore } from '@/store/request-draft-store';
import { useRequestStore } from '@/store/request-store';
import { useSessionStore } from '@/store/session-store';

const mockReplace = jest.fn();
const mockRandomUUID = jest.fn();
const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ replace: mockReplace }),
  Redirect: (props: { readonly href: unknown }) => {
    mockRedirect(props.href);
    return null;
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => mockRandomUUID(),
}));

const client: ClientProfile = {
  id: 'cli_route',
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  pinHash: 'hashed-pin',
  pinSalt: 'random-salt',
  createdAt: 1,
  updatedAt: 1,
};

const child: ChildDraftRecord = {
  id: 'chd_route',
  firstName: 'Junior',
  yearOfBirth: 2016,
  level: 'P4',
  createdAt: 1,
  updatedAt: 1,
};

const childNeed: ChildLearningNeedDraft = {
  id: 'ned_route',
  childId: child.id,
  learnerIsClient: false,
  subject: 'Mathematics',
  level: 'P4',
  objective: 'Build confidence with fractions',
  frequency: 'weekly_2',
  sessionMinutes: 45,
  availability: 'Tuesday evenings',
  format: 'online',
  createdAt: 1,
  updatedAt: 1,
};

function prepareStores(): void {
  useSessionStore.getState().setLocaleOverride('en');
  useRequestDraftStore.setState({
    journeyType: 'child',
    contact: {
      firstName: 'Amina',
      lastName: 'Kabila',
      phone: '+243812345678',
    },
    clientId: client.id,
    children: [child],
    needsByChildId: { [child.id]: [childNeed] },
    selfNeeds: [],
    tutorPreference: 'same',
  });
  useClientStore.setState({ clients: [client] });
}

describe('request submission routes', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRandomUUID.mockReset();
    mockRedirect.mockReset();
    mockRandomUUID.mockImplementation(() => `uuid-${mockRandomUUID.mock.calls.length}`);
    useRequestDraftStore.getState().clearDraft();
    useChildStore.setState({ children: [] });
    useClientStore.setState({ clients: [] });
    useDomainStore.setState({ needs: [] });
    useRequestStore.setState({ requests: [] });
    useActivityStore.setState({ events: [] });
    useNotificationStore.setState({ notifications: [] });
  });

  it('submits the parent draft, clears it, and shows the stored reference', async () => {
    prepareStores();

    const reviewRoute = await render(<ReviewRoute />);
    expect(screen.getAllByText('Junior').length).toBeGreaterThan(0);
    expect(screen.getByText('2016')).toBeTruthy();
    expect(screen.getByText('Build confidence with fractions')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('review-submit'));

    const request = useRequestStore.getState().requests[0];
    expect(request).toMatchObject({
      id: 'req_uuid-1',
      reference: expect.stringMatching(/^MP-\d{4}-0001$/),
      status: 'received',
    });
    expect(useChildStore.getState().children).toHaveLength(1);
    expect(useDomainStore.getState().needs[0]?.requestId).toBe('req_uuid-1');
    expect(useActivityStore.getState().events).toHaveLength(1);
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    expect(useRequestDraftStore.getState()).toMatchObject({
      journeyType: null,
      contact: null,
      clientId: null,
      children: [],
      needsByChildId: {},
      selfNeeds: [],
    });
    expect(mockRedirect).toHaveBeenCalledWith({
      pathname: '/submitted',
      params: { requestId: 'req_uuid-1' },
    });

    reviewRoute.unmount();
  });
});
