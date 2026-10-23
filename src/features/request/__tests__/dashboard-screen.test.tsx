import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { useSessionStore } from '@/store/session-store';

import { DashboardScreen, type DashboardScreenProps } from '../screens/dashboard-screen';

const request = {
  id: 'req_1',
  reference: 'MP-2026-0001',
  status: 'received' as const,
  createdAt: new Date('2026-05-01T12:00:00Z').getTime(),
};

const otherRequest = {
  id: 'req_2',
  reference: 'MP-2025-0004',
  status: 'completed' as const,
};

const needGroups = [
  {
    id: 'chd_1',
    name: 'Junior Kabila',
    needs: [
      {
        id: 'ned_1',
        subject: 'Mathematics',
        level: 'P4',
        frequency: 'Twice a week',
      },
    ],
  },
];

function createProps(overrides: Partial<DashboardScreenProps> = {}): DashboardScreenProps {
  return {
    firstName: 'Amina',
    request,
    needGroups,
    requests: [otherRequest],
    unreadNotificationCount: 2,
    onStartRequest: jest.fn(),
    onNotifications: jest.fn(),
    onSelectRequest: jest.fn(),
    ...overrides,
  };
}

describe('DashboardScreen', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the empty state and starts a request', async () => {
    const onStartRequest = jest.fn();
    const { getByTestId, getByText, queryByTestId } = await render(<DashboardScreen {...createProps({
      firstName: undefined,
      request: null,
      needGroups: [],
      requests: [],
      unreadNotificationCount: 0,
      onStartRequest,
    })} />);

    expect(getByTestId('dashboard-empty')).toBeTruthy();
    expect(getByText('No request yet')).toBeTruthy();
    fireEvent.press(getByTestId('dashboard-start-request'));
    expect(onStartRequest).toHaveBeenCalledTimes(1);
    expect(queryByTestId('dashboard-status-card')).toBeNull();
  });

  it('shows the greeting, status, next step, timeline, needs and unread badge', async () => {
    const { getByText, getByTestId, queryByText } = await render(<DashboardScreen {...createProps()} />);

    await waitFor(() => {
      expect(getByText('Hello Amina.')).toBeTruthy();
    });
    expect(getByTestId('dashboard-status-badge')).toHaveTextContent('Received');
    expect(getByText('We are reviewing your request')).toBeTruthy();
    expect(getByText('MP-2026-0001')).toBeTruthy();
    expect(getByText('Request progress')).toBeTruthy();
    expect(getByText('Junior Kabila')).toBeTruthy();
    expect(getByText('Mathematics')).toBeTruthy();
    expect(getByText('2 unread notifications')).toBeTruthy();
    expect(getByTestId('dashboard-unread-badge')).toBeTruthy();
    expect(queryByText('Administration (simulation)')).toBeNull();
  });

  it('opens notifications and selects another request', async () => {
    const onNotifications = jest.fn();
    const onSelectRequest = jest.fn();
    const anotherRequest = {
      id: 'req_3',
      reference: 'MP-2025-0005',
      status: 'completed' as const,
    };
    const { getByTestId } = await render(<DashboardScreen {...createProps({
      requests: [request, otherRequest, anotherRequest],
      onNotifications,
      onSelectRequest,
    })} />);

    fireEvent.press(getByTestId('dashboard-notifications'));
    expect(onNotifications).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('dashboard-request-req_3'));
    expect(onSelectRequest).toHaveBeenCalledWith('req_3');
  });

  it('renders the next-step action when a handler is available', async () => {
    const onNextStepAction = jest.fn();
    const { getByTestId } = await render(<DashboardScreen {...createProps({
      request: { ...request, status: 'proposal_sent' },
      onNextStepAction,
    })} />);

    await waitFor(() => {
      expect(getByTestId('dashboard-next-action')).toBeTruthy();
    });
    fireEvent.press(getByTestId('dashboard-next-action'));
    expect(onNextStepAction).toHaveBeenCalledWith('review_proposal');
  });
});