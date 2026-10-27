import { removeNeedDraft, upsertNeedDraft, formValuesToNeedDraft } from '../services/need-draft';
import type { AdultLearningNeedDraft } from '../types';
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

function createNeed(id: string, createdAt = 100): AdultLearningNeedDraft {
  const values = needFormSchema.parse({ ...validForm, subject: id });
  return formValuesToNeedDraft(values, id, createdAt, createdAt);
}

describe('adult learning need drafts', () => {
  beforeEach(() => {
    useRequestDraftStore.setState({
      journeyType: null,
      contact: null,
      clientId: null,
      children: [],
      onboardingByChildId: {},
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

    expect(formValuesToNeedDraft(values, 'ned_need1', 200, 100)).toEqual({
      id: 'ned_need1',
      learnerIsClient: true,
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

  it('keeps adult needs independent when they are updated or removed', () => {
    const firstNeed = createNeed('Mathematics');
    const secondNeed = createNeed('English', 200);
    const needs = upsertNeedDraft([], firstNeed);
    const twoNeeds = upsertNeedDraft(needs, secondNeed);
    const updatedNeeds = upsertNeedDraft(twoNeeds, { ...firstNeed, level: 'P5' });

    expect(updatedNeeds).toHaveLength(2);
    expect(updatedNeeds[0]?.level).toBe('P5');
    expect(removeNeedDraft(updatedNeeds, firstNeed.id)).toEqual([secondNeed]);
  });

  it('stores adult needs separately and removes them from the request draft', () => {
    const selfNeed = createNeed('Mathematics');

    useRequestDraftStore.getState().saveNeed(selfNeed);

    expect(selfNeed).not.toHaveProperty('childId');
    expect(useRequestDraftStore.getState().selfNeeds).toEqual([selfNeed]);

    useRequestDraftStore.getState().removeSelfNeed(selfNeed.id);
    expect(useRequestDraftStore.getState().selfNeeds).toEqual([]);
  });
});
