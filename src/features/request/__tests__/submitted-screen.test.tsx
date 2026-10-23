import { fireEvent, render, screen } from '@testing-library/react-native';

import { useSessionStore } from '@/store/session-store';

import { SubmittedScreen } from '../screens/submitted-screen';

describe('SubmittedScreen', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
  });

  it('shows the reference, explains the next steps, and opens the dashboard', async () => {
    const onDashboard = jest.fn();
    await render(
      <SubmittedScreen reference="MP-2026-0148" onDashboard={onDashboard} />,
    );

    expect(screen.getByText('Your request has been received')).toBeTruthy();
    expect(screen.getByText('MP-2026-0148').props.selectable).toBe(true);
    expect(screen.getByText('What happens next?')).toBeTruthy();
    expect(
      screen.getByText('Payment is verified before the service starts.'),
    ).toBeTruthy();

    await fireEvent.press(screen.getByTestId('submitted-dashboard'));
    expect(onDashboard).toHaveBeenCalledTimes(1);
  });
});
