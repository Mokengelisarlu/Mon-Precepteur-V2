import { create } from 'zustand';

import type { LearningNeed } from '@/features/request/types';

export interface DomainState {
  readonly needs: readonly LearningNeed[];
  saveNeeds: (needs: readonly LearningNeed[]) => void;
}

export const useDomainStore = create<DomainState>()((set) =>
  ({
    needs: [],
    saveNeeds: (needs) =>
      set((state) => {
        const savedById = new Map(state.needs.map((need) => [need.id, need]));
        for (const need of needs) {
          savedById.set(need.id, need);
        }
        return { needs: Array.from(savedById.values()) };
      }),
  }),
);
