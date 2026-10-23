import {
  formValuesToNeedDraft,
  removeChildNeedDrafts,
  removeNeedDraft,
  upsertNeedDraft,
} from '../services/need-draft';
import type {
  AdultLearningNeedDraft,
  ChildLearningNeedDraft,
} from '../types';
import { needFormSchema } from '../validation';
import { useRequestDraftStore } from '@/store/request-draft-store';

const validForm = {
  subject: 'Mathematics',
  level: 'P4',
  objective: 'Build confidence with fractions',
  frequency: 'weekly_2',
  sessionMinutes: '45',
  availability: 'Tuesday and Thursday after 4 pm',
  format: 'online',
  location: '',
  notes: '',
};

function createNeed(id: string, childId: string, createdAt = 100): ChildLearningNeedDraft {
  const values = needFormSchema.parse({ ...validForm, subject: id });
  return formValuesToNeedDraft(
    values,
    { type: 'child', childId },
    id,
    createdAt,
    createdAt,
  );
}

function createSelfNeed(id: string, createdAt = 100): AdultLearningNeedDraft {
  const values = needFormSchema.parse({ ...validForm, subject: id });
  return formValuesToNeedDraft(values, { type: 'self' }, id, createdAt, createdAt);
}

describe('learning need drafts', () => {
  beforeEach(() => {
    useRequestDraftStore.setState({
      journeyType: null,
      contact: null,
      clientId: null,
      children: [],
      needsByChildId: {},
      selfNeeds: [],
      tutorPreference: 'none',
    });
  });

  it('normalizes optional fields and preserves creation time when edited', () => {
    const values = needFormSchema.parse({
      ...validForm,
      subject: ' Mathematics ',
      location: ' ',
      notes: ' ',
    });

    expect(
      formValuesToNeedDraft(
        values,
        { type: 'child', childId: 'chd_child1' },
        'ned_need1',
        200,
        100,
      ),
    ).toEqual({
      id: 'ned_need1',
      childId: 'chd_child1',
      learnerIsClient: false,
      subject: 'Mathematics',
      level: 'P4',
      objective: 'Build confidence with fractions',
      frequency: 'weekly_2',
      sessionMinutes: 45,
      availability: 'Tuesday and Thursday after 4 pm',
      format: 'online',
      createdAt: 100,
      updatedAt: 200,
    });
  });

  it('keeps multiple needs independent and scopes them to each child', () => {
    const firstNeed = createNeed('ned_math', 'chd_child1');
    const secondNeed = createNeed('ned_french', 'chd_child1', 200);
    const otherChildNeed = createNeed('ned_science', 'chd_child2', 300);

    const childNeeds = upsertNeedDraft([], firstNeed);
    const twoNeeds = upsertNeedDraft(childNeeds, secondNeed);
    const updatedNeeds = upsertNeedDraft(twoNeeds, { ...firstNeed, level: 'P5' });

    expect(updatedNeeds).toHaveLength(2);
    expect(updatedNeeds[0]?.level).toBe('P5');
    expect(removeNeedDraft(updatedNeeds, firstNeed.id)).toEqual([secondNeed]);
    expect(
      removeChildNeedDrafts(
        {
          chd_child1: updatedNeeds,
          chd_child2: [otherChildNeed],
        },
        'chd_child1',
      ),
    ).toEqual({ chd_child2: [otherChildNeed] });
  });

  it('stores needs by child and removes a child’s needs with the child', () => {
    const firstNeed = createNeed('ned_math', 'chd_child1');
    const secondNeed = createNeed('ned_french', 'chd_child1', 200);
    const otherChildNeed = createNeed('ned_science', 'chd_child2', 300);
    const store = useRequestDraftStore.getState();

    store.saveNeed(firstNeed);
    useRequestDraftStore.getState().saveNeed(secondNeed);
    useRequestDraftStore.getState().saveNeed(otherChildNeed);

    expect(useRequestDraftStore.getState().needsByChildId).toEqual({
      chd_child1: [firstNeed, secondNeed],
      chd_child2: [otherChildNeed],
    });

    useRequestDraftStore.getState().removeChild('chd_child1');
    expect(useRequestDraftStore.getState().needsByChildId).toEqual({
      chd_child2: [otherChildNeed],
    });
  });

  it('creates adult needs without a child id and stores them separately', () => {
    const selfNeed = createSelfNeed('ned_self_math');
    const childNeed = createNeed('ned_child_math', 'chd_child1');

    useRequestDraftStore.getState().saveNeed(selfNeed);
    useRequestDraftStore.getState().saveNeed(childNeed);

    expect(selfNeed).not.toHaveProperty('childId');
    expect(useRequestDraftStore.getState().selfNeeds).toEqual([selfNeed]);
    expect(useRequestDraftStore.getState().needsByChildId).toEqual({
      chd_child1: [childNeed],
    });

    useRequestDraftStore.getState().removeSelfNeed(selfNeed.id);

    expect(useRequestDraftStore.getState().selfNeeds).toEqual([]);
    expect(useRequestDraftStore.getState().needsByChildId).toEqual({
      chd_child1: [childNeed],
    });
  });
});
