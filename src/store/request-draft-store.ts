import { create } from 'zustand';

import {
  removeChildDraft,
} from '@/features/children/services/child-draft';
import type { ChildDraftRecord, ChildOnboardingData } from '@/features/children/types';
import type { ClientContactDetails } from '@/features/client/types';
import {
  removeNeedDraft,
  upsertNeedDraft,
} from '@/features/request/services/need-draft';
import type {
  AdultLearningNeedDraft,
  JourneyType,
  TutorPreference,
} from '@/features/request/types';

export interface RequestDraftState {
  journeyType: JourneyType | null;
  contact: ClientContactDetails | null;
  clientId: string | null;
  children: readonly ChildDraftRecord[];
  onboardingByChildId: Readonly<Record<string, ChildOnboardingData>>;
  selfNeeds: readonly AdultLearningNeedDraft[];
  tutorPreference: TutorPreference;
  setJourneyType: (journeyType: JourneyType) => void;
  clearJourneyType: () => void;
  clearDraft: () => void;
  saveContact: (contact: ClientContactDetails, clientId: string) => void;
  saveChild: (child: ChildDraftRecord) => void;
  saveChildOnboarding: (childId: string, data: ChildOnboardingData) => void;
  removeChild: (childId: string) => void;
  saveNeed: (need: AdultLearningNeedDraft) => void;
  removeSelfNeed: (needId: string) => void;
  setTutorPreference: (preference: TutorPreference) => void;
}

export const useRequestDraftStore = create<RequestDraftState>()((set) => ({
  journeyType: null,
  contact: null,
  clientId: null,
  children: [],
  onboardingByChildId: {},
  selfNeeds: [],
  tutorPreference: 'none',
  setJourneyType: (journeyType) => set({ journeyType }),
  clearJourneyType: () => set({ journeyType: null }),
  clearDraft: () =>
    set({
      journeyType: null,
      contact: null,
      clientId: null,
      children: [],
      onboardingByChildId: {},
      selfNeeds: [],
      tutorPreference: 'none',
    }),
  saveContact: (contact, clientId) => set({ contact, clientId }),
  saveChild: (child) =>
    set((state) => ({
      children: [child],
      onboardingByChildId:
        state.children[0]?.id === child.id ? state.onboardingByChildId : {},
    })),
  saveChildOnboarding: (childId, data) =>
    set((state) => ({
      onboardingByChildId: { ...state.onboardingByChildId, [childId]: data },
    })),
  removeChild: (childId) =>
    set((state) => {
      const { [childId]: _removedOnboarding, ...otherOnboarding } =
        state.onboardingByChildId;

      return {
        children: removeChildDraft(state.children, childId),
        onboardingByChildId: otherOnboarding,
      };
    }),
  saveNeed: (need) => set((state) => ({ selfNeeds: upsertNeedDraft(state.selfNeeds, need) })),
  removeSelfNeed: (needId) =>
    set((state) => ({
      selfNeeds: removeNeedDraft(state.selfNeeds, needId),
    })),
  setTutorPreference: (tutorPreference) => set({ tutorPreference }),
}));
