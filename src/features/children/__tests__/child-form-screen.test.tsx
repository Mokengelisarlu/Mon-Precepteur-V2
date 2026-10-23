import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ChildFormScreen } from '@/features/children/screens/child-form-screen';
import type { ChildDraftRecord } from '@/features/children/types';
import { useSessionStore } from '@/store/session-store';

describe('Child form screen', () => {
  const onCancel = jest.fn();
  const onSave = jest.fn<void, [ChildDraftRecord, boolean]>();

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    onCancel.mockReset();
    onSave.mockReset();
  });

  it('shows required-field validation when submitted empty', async () => {
    await render(<ChildFormScreen onCancel={onCancel} onSave={onSave} />);

    await fireEvent.press(screen.getByTestId('child-save'));

    expect(await screen.findByText('Le prénom est requis')).toBeTruthy();
    expect(await screen.findByText('Le niveau scolaire est requis')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a valid child with a selected school level', async () => {
    await render(<ChildFormScreen onCancel={onCancel} onSave={onSave} />);

    await fireEvent.changeText(screen.getByTestId('child-first-name'), 'Amina');
    const yearOfBirth = new Date().getFullYear() - 10;
    await fireEvent.changeText(screen.getByTestId('child-year-of-birth'), String(yearOfBirth));
    await fireEvent.press(screen.getByTestId('child-level'));
    await fireEvent.press(screen.getByText('Primaire · P4'));
    await fireEvent.press(screen.getByTestId('child-save'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const savedChild = onSave.mock.calls[0]?.[0];
    const isNew = onSave.mock.calls[0]?.[1];
    expect(savedChild?.id).toMatch(/^chd_/);
    expect(savedChild).toMatchObject({ firstName: 'Amina', yearOfBirth, level: 'P4' });
    expect(isNew).toBe(true);
  });
});
