import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import { useSessionStore } from '@/store/session-store';

const ROUTES = [
  '/request-type',
  '/children',
  '/children/form',
  '/needs/child/chd_1234',
  '/needs/self',
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

describe('Route tree', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
  });

  it('reaches every route of the tree', async () => {
    const result = renderRouter(undefined, { initialUrl: '/welcome' });

    await result;

    for (const route of ROUTES) {
      await act(async () => {
        router.navigate(route);
      });

      expect(result.getPathnameWithParams()).toBe(route);
      expect(screen.getByText(route)).toBeTruthy();
      expect(screen.queryByTestId('not-found-state')).toBeNull();
    }
  });
});
