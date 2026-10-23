import { fireEvent, render, screen } from '@testing-library/react-native';

import { ToastHost } from '@/components/feedback';
import { AdultNeedsScreen } from '@/features/request/screens/adult-needs-screen';
import type { AdultLearningNeedDraft, LearningNeedDraft } from '@/features/request/types';
import { useSessionStore } from '@/store/session-store';

describe('Adult needs screen', () => {
  const onSaveNeed = jest.fn((_need: LearningNeedDraft): void => {});
  const onRemoveNeed = jest.fn();
  const onTutorPreferenceChange = jest.fn();
  const onBack = jest.fn();
  const onContinue = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
    onSaveNeed.mockReset();
    onRemoveNeed.mockReset();
    onTutorPreferenceChange.mockReset();
    onBack.mockReset();
    onContinue.mockReset();
  });

  function renderScreen(needs: readonly AdultLearningNeedDraft[] = []) {
    return render(
      <ToastHost>
        <AdultNeedsScreen
          needs={needs}
          tutorPreference="none"
          onSaveNeed={onSaveNeed}
          onRemoveNeed={onRemoveNeed}
          onTutorPreferenceChange={onTutorPreferenceChange}
          onBack={onBack}
          onContinue={onContinue}
        />
      </ToastHost>,
    );
  }

  it('shows the adult-specific empty state and blocks continuing without a need', async () => {
    await renderScreen();

    expect(screen.getByText('What do you need to work on?')).toBeTruthy();
    expect(screen.getByText('Your learning needs')).toBeTruthy();
    expect(screen.getByText('No needs yet')).toBeTruthy();
    expect(screen.queryByText(/child/i)).toBeNull();
    expect(screen.getByTestId('adult-needs-continue').props.accessibilityState.disabled).toBe(
      true,
    );

    await fireEvent.press(screen.getByTestId('adult-needs-continue'));

    expect(onContinue).not.toHaveBeenCalled();
  });

  it('uses the shared validation and saves needs for the adult learner', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId('need-empty-add'));
    await fireEvent.press(screen.getByTestId('need-save'));

    expect(screen.getByText('Enter the subject or skill')).toBeTruthy();
    expect(onSaveNeed).not.toHaveBeenCalled();
    expect(screen.getByTestId('need-form-sheet')).toBeTruthy();

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

    const savedNeed = onSaveNeed.mock.calls[0]?.[0];
    expect(savedNeed).toMatchObject({
      learnerIsClient: true,
      subject: 'Mathematics',
      frequency: 'weekly_2',
      sessionMinutes: 45,
      format: 'online',
    });
    expect(savedNeed).not.toHaveProperty('childId');
    expect(screen.queryByTestId('need-form-sheet')).toBeNull();
  });
});
