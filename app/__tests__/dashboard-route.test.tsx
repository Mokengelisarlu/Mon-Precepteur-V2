import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import type { ChildRecord } from '@/features/children';
import type { ClientProfile } from '@/features/client';
import type { Notification } from '@/features/notification';
import type { LearningNeed, RequestRecord } from '@/features/request/types';
import { useChildStore } from '@/store/child-store';
import { useClientStore } from '@/store/client-store';
import { useDomainStore } from '@/store/domain-store';
import { useNotificationStore } from '@/store/notification-store';
import { useRequestStore } from '@/store/request-store';
import { useSessionStore } from '@/store/session-store';

const client: ClientProfile = {
  id: 'cli_1',
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  pinHash: 'hashed-pin',
  pinSalt: 'random-salt',
  createdAt: 100,
  updatedAt: 100,
};

const child: ChildRecord = {
  id: 'chd_1',
  clientId: client.id,
  firstName: 'Junior',
  lastName: 'Kabila',
  yearOfBirth: 2016,
  level: 'P4',
  createdAt: 100,
  updatedAt: 100,
};

const need: LearningNeed = {
  id: 'ned_1',
  requestId: 'req_1',
  childId: child.id,
  learnerIsClient: false,
  subject: 'Mathematics',
  level: 'P4',
  objective: 'Build confidence with fractions',
  frequency: 'weekly_2',
  sessionMinutes: 45,
  availability: 'Tuesday evenings',
  format: 'online',
  createdAt: 100,
  updatedAt: 100,
};

const receivedRequest: RequestRecord = {
  id: 'req_2',
  reference: 'MP-2026-0002',
  clientId: client.id,
  needIds: [need.id],
  tutorPreference: 'none',
  status: 'received',
  createdAt: 2000,
  updatedAt: 2000,
  submittedAt: 2000,
  type: 'child',
  childIds: [child.id],
};

const completedRequest: RequestRecord = {
  id: 'req_1',
  reference: 'MP-2026-0001',
  clientId: client.id,
  needIds: [need.id],
  tutorPreference: 'none',
  status: 'completed',
  createdAt: 1000,
  updatedAt: 1000,
  submittedAt: 1000,
  type: 'child',
  childIds: [child.id],
};

const unreadNotification: Notification = {
  id: 'ntf_1',
  clientId: client.id,
  requestId: receivedRequest.id,
  type: 'request_received',
  titleKey: 'notification.requestReceived.title',
  bodyKey: 'notification.requestReceived.body',
  params: { reference: receivedRequest.reference },
  createdAt: 2000,
};

describe('Dashboard route', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    useClientStore.setState({ clients: [client] });
    useRequestStore.setState({ requests: [receivedRequest] });
    useDomainStore.setState({ needs: [need] });
    useChildStore.setState({ children: [child] });
    useNotificationStore.setState({ notifications: [unreadNotification] });
  });

  it('renders the latest request with its needs and unread notifications', async () => {
    const result = renderRouter(undefined, { initialUrl: '/dashboard' });

    await result;

    expect(result.getPathnameWithParams()).toBe('/dashboard');
    expect(screen.getByTestId('dashboard-screen')).toBeTruthy();
    expect(screen.getByText('Hello Amina.')).toBeTruthy();
    expect(screen.getByText('MP-2026-0002')).toBeTruthy();
    expect(screen.getByText('Junior Kabila')).toBeTruthy();
    expect(screen.getByText('Mathematics')).toBeTruthy();
    expect(screen.getByText('1 unread notification')).toBeTruthy();
  });

  it('renders the empty state when no request exists', async () => {
    useRequestStore.setState({ requests: [] });
    useNotificationStore.setState({ notifications: [] });

    const result = renderRouter(undefined, { initialUrl: '/dashboard' });

    await result;

    expect(screen.getByText('No request yet')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('dashboard-start-request'));

    expect(result.getPathnameWithParams()).toBe('/request-type');
  });

  it('switches the displayed request from the requests list', async () => {
    useRequestStore.setState({ requests: [receivedRequest, completedRequest] });

    const result = renderRouter(undefined, { initialUrl: '/dashboard' });

    await result;

    expect(screen.getByText('We are reviewing your request')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('dashboard-request-req_1'));

    expect(screen.getByText('Service completed')).toBeTruthy();
  });
});
