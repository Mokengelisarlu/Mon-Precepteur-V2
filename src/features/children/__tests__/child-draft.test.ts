import {
  childDraftToFormValues,
  childDraftToRecord,
  childRecordToDraft,
  formValuesToChildDraft,
  removeChildDraft,
} from '../services/child-draft';
import {
  buildChildDraftFromOnboarding,
  childToOnboardingData,
} from '../services/child-onboarding';
import { createEmptyChildOnboardingData, type ChildDraftRecord } from '../types';
import { useRequestDraftStore } from '@/store/request-draft-store';

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
  it('removes the selected child from the request draft', () => {
    expect(removeChildDraft([child], child.id)).toEqual([]);
  });
});

describe('request draft child limit', () => {
  afterEach(() => {
    useRequestDraftStore.getState().clearDraft();
  });

  it('replaces the child draft and clears its onboarding context when the child changes', () => {
    const secondChild: ChildDraftRecord = {
      ...child,
      id: 'chd_child2',
      firstName: 'David',
    };

    useRequestDraftStore.getState().clearDraft();
    useRequestDraftStore.getState().saveChild(child);
    useRequestDraftStore.getState().saveChildOnboarding(child.id, {
      ...createEmptyChildOnboardingData(),
      firstName: child.firstName,
    });

    useRequestDraftStore.getState().saveChild(secondChild);

    expect(useRequestDraftStore.getState().children).toEqual([secondChild]);
    expect(useRequestDraftStore.getState().onboardingByChildId).toEqual({});
  });
});

describe('child onboarding conversions', () => {
  const onboarding = {
    ...createEmptyChildOnboardingData(),
    firstName: 'Amina',
    lastName: 'Mukendi',
    birthYear: String(new Date().getFullYear() - 10),
    gender: 'girl',
    grade: 'p4',
    school: 'Institut Mwangaza',
    estimatedLevel: 'satisfactory',
    notes: 'Needs encouragement.',
  };

  it('builds a child draft from the onboarding wizard data', () => {
    const draft = buildChildDraftFromOnboarding(onboarding, 'chd_child1', 200, 100);

    expect(draft).toMatchObject({
      id: 'chd_child1',
      firstName: 'Amina',
      lastName: 'Mukendi',
      level: 'P4',
      school: 'Institut Mwangaza',
      gender: 'girl',
      estimatedLevel: 'satisfactory',
      createdAt: 100,
      updatedAt: 200,
    });
  });

  it('restores the wizard data from a child record', () => {
    const draft = buildChildDraftFromOnboarding(onboarding, 'chd_child1', 200);
    const restored = childToOnboardingData(draft);

    expect(restored).toMatchObject({
      firstName: 'Amina',
      lastName: 'Mukendi',
      grade: 'p4',
      school: 'Institut Mwangaza',
      gender: 'girl',
      estimatedLevel: 'satisfactory',
    });
  });
});

describe('request draft onboarding storage', () => {
  afterEach(() => {
    useRequestDraftStore.getState().clearDraft();
  });

  it('keeps onboarding data for the current child and clears it when the child changes', () => {
    const onboarding = createEmptyChildOnboardingData();
    useRequestDraftStore.getState().saveChild(child);
    useRequestDraftStore.getState().saveChildOnboarding(child.id, onboarding);

    expect(useRequestDraftStore.getState().onboardingByChildId[child.id]).toEqual(onboarding);

    const secondChild: ChildDraftRecord = { ...child, id: 'chd_child2' };
    useRequestDraftStore.getState().saveChild(secondChild);

    expect(useRequestDraftStore.getState().onboardingByChildId).toEqual({});
  });

  it('removes onboarding data with the child and clears it with the draft', () => {
    const onboarding = createEmptyChildOnboardingData();
    useRequestDraftStore.getState().saveChild(child);
    useRequestDraftStore.getState().saveChildOnboarding(child.id, onboarding);

    useRequestDraftStore.getState().removeChild(child.id);
    expect(useRequestDraftStore.getState().onboardingByChildId).toEqual({});

    useRequestDraftStore.getState().saveChild(child);
    useRequestDraftStore.getState().saveChildOnboarding(child.id, onboarding);
    useRequestDraftStore.getState().clearDraft();
    expect(useRequestDraftStore.getState().onboardingByChildId).toEqual({});
  });
});
