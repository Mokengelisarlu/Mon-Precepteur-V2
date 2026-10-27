import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastHost } from '@/components/feedback/ToastHost';

import type { ChildDraftRecord, ChildOnboardingData } from '@/features/children';
import type { ClientProfile } from '@/features/client';

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
  city: 'Lubumbashi',
  commune: 'Kampemba',
  quartier: 'Bel-Air',
  avenue: 'Avenue Lumumba',
  number: '12B',
  address: '12B, Avenue Lumumba, Bel-Air, Kampemba, Lubumbashi',
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

const learningContext: ChildOnboardingData = {
  firstName: 'Junior',
  lastName: '',
  birthYear: '2016',
  gender: 'boy',
  grade: 'p4',
  school: '',
  estimatedLevel: 'satisfactory',
  subjects: ['mathematics'],
  otherSubject: '',
  goals: ['homework'],
  notes: '',
  startDate: '2026-05-08',
  frequency: 'weekly_3',
  days: ['mon', 'tue', 'wed'],
  slots: ['evening'],
};

function prepareStores(): void {
  useSessionStore.getState().setLocaleOverride('en');
  useRequestDraftStore.setState({
    journeyType: 'child',
    contact: {
      firstName: 'Amina',
      lastName: 'Kabila',
      phone: '+243812345678',
      city: 'Lubumbashi',
      commune: 'Kampemba',
      quartier: 'Bel-Air',
      avenue: 'Avenue Lumumba',
      number: '12B',
      address: '12B, Avenue Lumumba, Bel-Air, Kampemba, Lubumbashi',
    },
    clientId: client.id,
    children: [child],
    onboardingByChildId: { [child.id]: learningContext },
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

  it('submits the parent draft without need records, clears it, and shows a success toast', async () => {
    prepareStores();

    const reviewRoute = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ToastHost>
          <ReviewRoute />
        </ToastHost>
      </SafeAreaProvider>,
    );
    expect(screen.getAllByText('Junior').length).toBeGreaterThan(0);
    expect(screen.getByText('2016')).toBeTruthy();
    expect(screen.getByText('Mathematics')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('review-submit'));

    const request = useRequestStore.getState().requests[0];
    expect(request).toMatchObject({
      id: 'req_uuid-1',
      reference: expect.stringMatching(/^MP-\d{4}-0001$/),
      status: 'received',
      type: 'child',
      needIds: [],
      learningContext,
    });
    expect(useChildStore.getState().children).toHaveLength(1);
    expect(useDomainStore.getState().needs).toEqual([]);
    expect(useActivityStore.getState().events).toHaveLength(1);
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    expect(useRequestDraftStore.getState()).toMatchObject({
      journeyType: null,
      contact: null,
      clientId: null,
      children: [],
      onboardingByChildId: {},
      selfNeeds: [],
    });
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByText('Your request has been submitted successfully.')).toBeTruthy();

    reviewRoute.unmount();
  });
});
