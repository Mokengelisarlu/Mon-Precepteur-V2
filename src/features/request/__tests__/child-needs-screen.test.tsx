import { fireEvent, render, screen } from '@testing-library/react-native';

import { ToastHost } from '@/components/feedback';
import { ChildNeedsScreen } from '@/features/request/screens/child-needs-screen';
import type {
  ChildLearningNeedDraft,
  TutorPreference,
} from '@/features/request/types';
import type { ChildDraftRecord } from '@/features/children/types';
import { useSessionStore } from '@/store/session-store';

const child: ChildDraftRecord = {
  id: 'chd_child1',
  firstName: 'Amina',
  yearOfBirth: new Date().getFullYear() - 10,
  level: 'P4',
  createdAt: 100,
  updatedAt: 100,
};

const need: ChildLearningNeedDraft = {
  id: 'ned_need1',
  childId: child.id,
  learnerIsClient: false,
  subject: 'Mathematics',
  level: 'P4',
  objective: 'Build confidence with fractions',
  frequency: 'weekly_2',
  sessionMinutes: 45,
  availability: 'Tuesday and Thursday after 4 pm',
  format: 'online',
  createdAt: 100,
  updatedAt: 100,
};

describe('Child needs screen', () => {
  const onSaveNeed = jest.fn();
  const onRemoveNeed = jest.fn();
  const onTutorPreferenceChange = jest.fn();
  const onBack = jest.fn();
  const onContinue = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    onSaveNeed.mockReset();
    onRemoveNeed.mockReset();
    onTutorPreferenceChange.mockReset();
    onBack.mockReset();
    onContinue.mockReset();
  });

  function renderScreen(
    needs: readonly ChildLearningNeedDraft[],
    tutorPreference: TutorPreference = 'none',
  ) {
    return render(
      <ToastHost>
        <ChildNeedsScreen
          child={child}
          needs={needs}
          tutorPreference={tutorPreference}
          onSaveNeed={onSaveNeed}
          onRemoveNeed={onRemoveNeed}
          onTutorPreferenceChange={onTutorPreferenceChange}
          onBack={onBack}
          onContinue={onContinue}
        />
      </ToastHost>,
    );
  }

  it('shows the empty state and prevents continuing until one need is added', async () => {
    await renderScreen([]);

    expect(screen.getByText('Décrivez ce sur quoi cet enfant doit travailler.')).toBeTruthy();
    expect(screen.getByTestId('child-needs-continue').props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByTestId('child-needs-continue'));
    expect(onContinue).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('need-empty-add'));
    expect(screen.getByTestId('need-form-sheet')).toBeTruthy();
  });

  it('shows each need, confirms removal and reports tutor preference changes', async () => {
    await renderScreen([need]);

    expect(screen.getByTestId('need-edit-ned_need1')).toBeTruthy();
    expect(screen.getByTestId('child-needs-continue').props.accessibilityState.disabled).toBe(false);

    await fireEvent.press(screen.getByTestId('need-remove-ned_need1'));
    expect(onRemoveNeed).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Retirer le besoin'));
    expect(onRemoveNeed).toHaveBeenCalledWith(need.id);

    await fireEvent.press(screen.getByTestId('tutor-preference-same'));
    expect(onTutorPreferenceChange).toHaveBeenCalledWith('same');

    await fireEvent.press(screen.getByTestId('child-needs-continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('shows the edit sheet for an existing need', async () => {
    await renderScreen([need]);

    await fireEvent.press(screen.getByTestId('need-edit-ned_need1'));

    expect(screen.getByTestId('need-form-sheet')).toBeTruthy();
    expect(screen.getByTestId('need-subject').props.value).toBe(need.subject);
  });

  it('shows a location field only for in-person formats', async () => {
    await renderScreen([]);
    await fireEvent.press(screen.getByTestId('need-empty-add'));

    expect(screen.queryByTestId('need-location')).toBeNull();

    await fireEvent.press(screen.getByText('À domicile'));
    expect(screen.getByTestId('need-location')).toBeTruthy();

    await fireEvent.press(screen.getByText('En ligne'));
    expect(screen.queryByTestId('need-location')).toBeNull();
  });

  it('shows translated validation errors and keeps an invalid new need open', async () => {
    await renderScreen([]);
    await fireEvent.press(screen.getByTestId('need-empty-add'));
    await fireEvent.press(screen.getByTestId('need-save'));

    expect(screen.getByText('Indiquez la matière ou la compétence')).toBeTruthy();
    expect(screen.getByTestId('need-form-sheet')).toBeTruthy();
    expect(onSaveNeed).not.toHaveBeenCalled();
  });

  it('saves a complete need and closes the form', async () => {
    await renderScreen([]);
    await fireEvent.press(screen.getByTestId('need-empty-add'));

    await fireEvent.press(screen.getByTestId('need-subject-suggestion-mathematics'));
    await fireEvent.changeText(screen.getByTestId('need-level'), 'P4');
    await fireEvent.changeText(
      screen.getByTestId('need-objective'),
      'Build confidence with fractions',
    );
    await fireEvent.press(screen.getByTestId('need-frequency'));
    await fireEvent.press(screen.getByText('2 fois par semaine'));
    await fireEvent.press(screen.getByTestId('need-session-minutes'));
    await fireEvent.press(screen.getByText('45 minutes'));
    await fireEvent.changeText(
      screen.getByTestId('need-availability'),
      'Tuesday and Thursday after 4 pm',
    );
    await fireEvent.press(screen.getByText('En ligne'));
    await fireEvent.press(screen.getByTestId('need-save'));

    expect(onSaveNeed).toHaveBeenCalledWith(
      expect.objectContaining({
        childId: child.id,
        subject: 'Mathématiques',
        frequency: 'weekly_2',
        sessionMinutes: 45,
        format: 'online',
      }),
    );
    expect(screen.queryByTestId('need-form-sheet')).toBeNull();
  });
});
