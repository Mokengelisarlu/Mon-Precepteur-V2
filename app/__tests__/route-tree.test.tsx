import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import { useClientStore } from '@/store/client-store';
import { useRequestDraftStore } from '@/store/request-draft-store';
import { useSessionStore } from '@/store/session-store';

const ROUTES = [
  '/login',
  '/request-type',
  '/children',
  '/children/form',
  '/needs/child/chd_1234',
  '/contact',
  '/pin',
  '/review',
  '/submitted',
  '/dashboard',
  '/proposal/prp_1234',
  '/contract/ctr_1234',
  '/invoice/inv_1234',
  '/payment/inv_1234',
  '/receipt/rcp_1234',
  '/tutor/ned_1234',
  '/notifications',
  '/admin',
  '/admin/request/req_1234',
  '/admin/proposal/new',
  '/admin/contract/new',
  '/admin/invoice/new',
  '/admin/payment/pay_1234',
  '/admin/receipt/issue',
  '/admin/assignment',
  '/admin/history',
];

const child = {
  id: 'chd_1234',
  firstName: 'Amina',
  yearOfBirth: new Date().getFullYear() - 10,
  level: 'P4',
  createdAt: 100,
  updatedAt: 100,
} as const;

describe('Route tree', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    useRequestDraftStore.setState({
      journeyType: 'child',
      contact: {
        firstName: 'Amina',
        lastName: 'Kabila',
        phone: '+243812345678',
      },
      clientId: 'cli_1234',
      children: [child],
      needsByChildId: {},
      selfNeeds: [],
      tutorPreference: 'none',
    });
    useClientStore.setState({
      clients: [
        {
          id: 'cli_1234',
          firstName: 'Amina',
          lastName: 'Kabila',
          phone: '+243812345678',
          pinHash: 'hashed-pin',
          pinSalt: 'random-salt',
          createdAt: 100,
          updatedAt: 100,
        },
      ],
    });
  });

  it('reaches every route of the tree', async () => {
    const result = renderRouter(undefined, { initialUrl: '/welcome' });

    await result;

    for (const route of ROUTES) {
      await act(async () => {
        router.navigate(route);
      });

      expect(result.getPathnameWithParams()).toBe(route);
      if (route === '/request-type') {
        expect(screen.getByTestId('request-type-sheet')).toBeTruthy();
      } else if (route === '/children') {
        expect(screen.getByTestId('child-list-screen')).toBeTruthy();
      } else if (route === '/children/form') {
        expect(screen.getByTestId('child-form-sheet')).toBeTruthy();
      } else if (route === '/needs/child/chd_1234') {
        expect(screen.getByText('What does Amina need?')).toBeTruthy();
      } else if (route === '/login') {
        expect(screen.getByTestId('login-unavailable-screen')).toBeTruthy();
      } else if (route === '/contact') {
        expect(screen.getByTestId('contact-screen')).toBeTruthy();
      } else if (route === '/pin') {
        expect(screen.getByTestId('pin-screen')).toBeTruthy();
      } else if (route === '/review') {
        expect(screen.getByTestId('review-screen')).toBeTruthy();
      } else if (route === '/submitted') {
        expect(screen.getByTestId('submitted-not-found')).toBeTruthy();
      } else {
        expect(screen.getByText(route)).toBeTruthy();
      }
      expect(screen.queryByTestId('not-found-state')).toBeNull();
    }
  });

  it('renders the adult needs route for an adult journey', async () => {
    useRequestDraftStore.setState({ journeyType: 'self' });
    const result = renderRouter(undefined, { initialUrl: '/needs/self' });

    await result;

    expect(result.getPathnameWithParams()).toBe('/needs/self');
    expect(screen.getByTestId('adult-needs-screen')).toBeTruthy();
  });
});
