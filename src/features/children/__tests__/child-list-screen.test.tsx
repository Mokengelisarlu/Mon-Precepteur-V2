import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChildListScreen } from '@/features/children/screens/child-list-screen';
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

describe('Child list screen', () => {
  const onAdd = jest.fn();
  const onEdit = jest.fn();
  const onRemove = jest.fn();
  const onContinue = jest.fn();

  beforeEach(() => {
    useSessionStore.getState().clearLocaleOverride();
    onAdd.mockReset();
    onEdit.mockReset();
    onRemove.mockReset();
    onContinue.mockReset();
  });

  it('renders the empty state and prevents continuing without a child', async () => {
    await render(
      <ChildListScreen
        childDrafts={[]}
        onAdd={onAdd}
        onEdit={onEdit}
        onRemove={onRemove}
        onContinue={onContinue}
      />,
    );

    expect(screen.getByTestId('children-empty-state')).toBeTruthy();
    expect(screen.getByText("Aucun enfant pour l'instant")).toBeTruthy();
    expect(screen.getByTestId('children-continue').props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(screen.getByTestId('children-continue'));
    expect(onContinue).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('children-empty-add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('shows child details, opens editing and requires confirmation to remove', async () => {
    await render(
      <ChildListScreen
        childDrafts={[child]}
        onAdd={onAdd}
        onEdit={onEdit}
        onRemove={onRemove}
        onContinue={onContinue}
      />,
    );

    expect(screen.getByText('Amina')).toBeTruthy();
    expect(
      screen.getByText(
        `Niveau : P4 · Âge estimé : ${new Date().getFullYear() - child.yearOfBirth} ans`,
      ),
    ).toBeTruthy();

    await fireEvent.press(screen.getByTestId('child-edit-chd_child1'));
    expect(onEdit).toHaveBeenCalledWith(child.id);

    await fireEvent.press(screen.getByTestId('child-remove-chd_child1'));
    expect(screen.getByText('Retirer Amina de cette demande ?')).toBeTruthy();
    expect(onRemove).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Retirer'));
    expect(onRemove).toHaveBeenCalledWith(child.id);
  });

  it('continues using the first child to start the child-needs step', async () => {
    await render(
      <ChildListScreen
        childDrafts={[child]}
        onAdd={onAdd}
        onEdit={onEdit}
        onRemove={onRemove}
        onContinue={onContinue}
      />,
    );

    await fireEvent.press(screen.getByTestId('children-continue'));

    expect(onContinue).toHaveBeenCalledWith(child.id);
  });
});
