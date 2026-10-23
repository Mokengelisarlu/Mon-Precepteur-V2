import { create } from 'zustand';

import {
  removeChildDraft,
  upsertChildDraft,
} from '@/features/children/services/child-draft';
import type { ChildDraftRecord } from '@/features/children/types';
import type { ClientContactDetails } from '@/features/client/types';
import {
  removeChildNeedDrafts,
  removeNeedDraft,
  upsertNeedDraft,
} from '@/features/request/services/need-draft';
import type {
  AdultLearningNeedDraft,
  ChildLearningNeedDraft,
  JourneyType,
  LearningNeedDraft,
  TutorPreference,
} from '@/features/request/types';

export interface RequestDraftState {
  journeyType: JourneyType | null;
  contact: ClientContactDetails | null;
  clientId: string | null;
  children: readonly ChildDraftRecord[];
  needsByChildId: Readonly<Record<string, readonly ChildLearningNeedDraft[]>>;
  selfNeeds: readonly AdultLearningNeedDraft[];
  tutorPreference: TutorPreference;
  setJourneyType: (journeyType: JourneyType) => void;
  clearJourneyType: () => void;
  clearDraft: () => void;
  saveContact: (contact: ClientContactDetails, clientId: string) => void;
  saveChild: (child: ChildDraftRecord) => void;
  removeChild: (childId: string) => void;
  saveNeed: (need: LearningNeedDraft) => void;
  removeNeed: (childId: string, needId: string) => void;
  removeSelfNeed: (needId: string) => void;
  setTutorPreference: (preference: TutorPreference) => void;
}

export const useRequestDraftStore = create<RequestDraftState>()((set) => ({
  journeyType: null,
  contact: null,
  clientId: null,
  children: [],
  needsByChildId: {},
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
      needsByChildId: {},
      selfNeeds: [],
      tutorPreference: 'none',
    }),
  saveContact: (contact, clientId) => set({ contact, clientId }),
  saveChild: (child) =>
    set((state) => ({ children: upsertChildDraft(state.children, child) })),
  removeChild: (childId) =>
    set((state) => ({
      children: removeChildDraft(state.children, childId),
      needsByChildId: removeChildNeedDrafts(state.needsByChildId, childId),
    })),
  saveNeed: (need) =>
    set((state) => {
      if (need.learnerIsClient) {
        return { selfNeeds: upsertNeedDraft(state.selfNeeds, need) };
      }

      const currentNeeds = state.needsByChildId[need.childId] ?? [];
      return {
        needsByChildId: {
          ...state.needsByChildId,
          [need.childId]: upsertNeedDraft(currentNeeds, need),
        },
      };
    }),
  removeNeed: (childId, needId) =>
    set((state) => {
      const currentNeeds = state.needsByChildId[childId] ?? [];
      const remainingNeeds = removeNeedDraft(currentNeeds, needId);
      const { [childId]: _removed, ...otherNeeds } = state.needsByChildId;

      return {
        needsByChildId: {
          ...otherNeeds,
          ...(remainingNeeds.length > 0 ? { [childId]: remainingNeeds } : {}),
        },
      };
    }),
  removeSelfNeed: (needId) =>
    set((state) => ({
      selfNeeds: removeNeedDraft(state.selfNeeds, needId),
    })),
  setTutorPreference: (tutorPreference) => set({ tutorPreference }),
}));
