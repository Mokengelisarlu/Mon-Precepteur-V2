import {
  childDraftToFormValues,
  childDraftToRecord,
  childRecordToDraft,
  formValuesToChildDraft,
  removeChildDraft,
  upsertChildDraft,
} from '../services/child-draft';
import type { ChildDraftRecord } from '../types';

const child: ChildDraftRecord = {
  id: 'chd_child1',
  firstName: 'Amina',
  yearOfBirth: new Date().getFullYear() - 10,
  level: 'P4',
  createdAt: 100,
  updatedAt: 100,
};

describe('child draft conversions', () => {
  it('converts form values to a draft record without empty optional fields', () => {
    expect(
      formValuesToChildDraft(
        {
          firstName: ' Amina ',
          lastName: '',
          yearOfBirth: String(new Date().getFullYear() - 10),
          level: ' P4 ',
          school: '',
          notes: '',
        },
        'chd_child1',
        200,
      ),
    ).toEqual({
      ...child,
      firstName: 'Amina',
      level: 'P4',
      createdAt: 200,
      updatedAt: 200,
    });
  });

  it('converts a draft record back into editable form values', () => {
    expect(childDraftToFormValues(child)).toEqual({
      firstName: 'Amina',
      lastName: '',
      yearOfBirth: String(new Date().getFullYear() - 10),
      level: 'P4',
      school: '',
      notes: '',
    });
  });

  it('converts a request child draft to and from the profile record shape', () => {
    const record = childDraftToRecord(child, 'cli_parent1');

    expect(record.clientId).toBe('cli_parent1');
    expect(childRecordToDraft(record)).toEqual(child);
  });
});

describe('child draft collection operations', () => {
  it('adds multiple children and updates an existing child without duplicating it', () => {
    const secondChild: ChildDraftRecord = {
      ...child,
      id: 'chd_child2',
      firstName: 'David',
    };
    const added = upsertChildDraft([], child);
    const twoChildren = upsertChildDraft(added, secondChild);
    const updated = upsertChildDraft(twoChildren, { ...child, firstName: 'Amina Rose' });

    expect(updated).toHaveLength(2);
    expect(updated[0]?.firstName).toBe('Amina Rose');
    expect(updated[1]?.firstName).toBe('David');
  });

  it('removes only the selected child', () => {
    const secondChild: ChildDraftRecord = {
      ...child,
      id: 'chd_child2',
      firstName: 'David',
    };

    expect(removeChildDraft([child, secondChild], child.id)).toEqual([secondChild]);
  });
});
