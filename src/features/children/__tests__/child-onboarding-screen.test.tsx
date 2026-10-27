import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChildOnboardingScreen } from '@/features/children/screens/child-onboarding-screen';
import type { ChildOnboardingData } from '@/features/children/types';
import { useSessionStore } from '@/store/session-store';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function completeProfile(): Promise<void> {
  await fireEvent.changeText(screen.getByTestId('child-first-name'), 'Amina');
  const birthYear = String(new Date().getFullYear() - 10);
  await fireEvent.press(screen.getByTestId('child-year-of-birth'));
  await fireEvent.press(screen.getByText(birthYear));
  await fireEvent.press(screen.getByTestId('child-gender'));
  await fireEvent.press(screen.getByText('Girl'));
}

async function completeToSchedule(): Promise<void> {
  await completeProfile();
  await fireEvent.press(screen.getByTestId('child-onboarding-next'));

  await fireEvent.press(screen.getByTestId('child-grade'));
  await fireEvent.press(screen.getByText('4th primary'));
  await fireEvent.press(screen.getByTestId('child-estimated-level'));
  await fireEvent.press(screen.getByText('Average'));
  await fireEvent.press(screen.getByTestId('child-onboarding-next'));

  await fireEvent.press(screen.getByTestId('child-subject-mathematics'));
  await fireEvent.press(screen.getByTestId('child-onboarding-next'));
}

describe('Child onboarding screen', () => {
  const onComplete = jest.fn<void, [ChildOnboardingData]>();
  const onExit = jest.fn();

  async function renderWizard(props: { onExit?: () => void } = {}) {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ChildOnboardingScreen onComplete={onComplete} {...props} />
      </SafeAreaProvider>,
    );
  }

  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    onComplete.mockReset();
    onExit.mockReset();
  });

  it('shows the four-step wizard and blocks an empty first step', async () => {
    await renderWizard({ onExit });

    expect(screen.getByTestId('child-onboarding-step')).toHaveTextContent('Child profile');
    expect(screen.getByRole('progressbar').props.accessibilityLabel).toBe('Step 1 of 4');

    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('requires at least one subject before leaving step three', async () => {
    await renderWizard();

    await completeProfile();
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await fireEvent.press(screen.getByTestId('child-grade'));
    await fireEvent.press(screen.getByText('4th primary'));
    await fireEvent.press(screen.getByTestId('child-estimated-level'));
    await fireEvent.press(screen.getByText('Average'));
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    expect(screen.getByTestId('child-onboarding-step')).toHaveTextContent('Child profile');
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    expect(screen.getByText('Choose at least one option')).toBeTruthy();
    expect(screen.getByTestId('child-onboarding-step')).toHaveTextContent('Child profile');
  });

  it('caps the selected days at the weekly session count and explains why', async () => {
    await renderWizard();
    await completeToSchedule();

    await fireEvent.press(screen.getByTestId('child-day-mon'));
    await fireEvent.press(screen.getByTestId('child-day-tue'));
    await fireEvent.press(screen.getByTestId('child-day-wed'));
    await fireEvent.press(screen.getByTestId('child-day-thu'));

    expect(
      screen.getByText('You can select only 3 days for 3 sessions per week.'),
    ).toBeTruthy();
    expect(screen.getByTestId('child-day-thu').props.accessibilityState.checked).toBe(false);
  });

  it('requires the selected days to match the weekly session count', async () => {
    await renderWizard();
    await completeToSchedule();

    await fireEvent.press(screen.getByTestId('child-day-mon'));
    await fireEvent.press(screen.getByTestId('child-day-tue'));
    await fireEvent.press(screen.getByTestId('child-slot-evening'));
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    expect(screen.getByText('Select exactly 3 days.')).toBeTruthy();
    expect(screen.getByTestId('child-day-mon')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('child-day-wed'));
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0]?.[0]).toMatchObject({
      days: ['mon', 'tue', 'wed'],
      slots: ['evening'],
    });
  });

  it('accepts a typed other subject without selecting a chip', async () => {
    await renderWizard();

    await completeProfile();
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await fireEvent.press(screen.getByTestId('child-grade'));
    await fireEvent.press(screen.getByText('4th primary'));
    await fireEvent.press(screen.getByTestId('child-estimated-level'));
    await fireEvent.press(screen.getByText('Average'));
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await fireEvent.changeText(screen.getByTestId('child-other-subject'), 'Philosophy');
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    expect(screen.getByTestId('child-day-mon')).toBeTruthy();
  });

  it('completes the full wizard and returns the onboarding data', async () => {
    await renderWizard();

    await completeProfile();
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await fireEvent.press(screen.getByTestId('child-grade'));
    await fireEvent.press(screen.getByText('4th primary'));
    await fireEvent.changeText(screen.getByTestId('child-school'), 'Institut Mwangaza');
    await fireEvent.press(screen.getByTestId('child-estimated-level'));
    await fireEvent.press(screen.getByText('Average'));
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await fireEvent.press(screen.getByTestId('child-subject-mathematics'));
    await fireEvent.changeText(screen.getByTestId('child-other-subject'), 'Philosophy');
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await fireEvent.press(screen.getByTestId('child-day-mon'));
    await fireEvent.press(screen.getByTestId('child-day-tue'));
    await fireEvent.press(screen.getByTestId('child-day-wed'));
    await fireEvent.press(screen.getByTestId('child-slot-evening'));
    expect(screen.queryByTestId('child-duration')).toBeNull();
    expect(screen.queryByTestId('child-commune')).toBeNull();
    expect(screen.queryByTestId('child-street')).toBeNull();
    await fireEvent.press(screen.getByTestId('child-onboarding-next'));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0]?.[0]).toMatchObject({
      firstName: 'Amina',
      gender: 'girl',
      grade: 'p4',
      estimatedLevel: 'intermediate',
      school: 'Institut Mwangaza',
      subjects: ['mathematics'],
      otherSubject: 'Philosophy',
      days: ['mon', 'tue', 'wed'],
      slots: ['evening'],
    });
    expect(onComplete.mock.calls[0]?.[0]).not.toHaveProperty('duration');
    expect(onComplete.mock.calls[0]?.[0]).not.toHaveProperty('street');
  });

  it('exits from the first step when there is no previous step', async () => {
    await renderWizard({ onExit });

    await fireEvent.press(screen.getByTestId('child-onboarding-back'));

    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
