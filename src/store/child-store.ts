import { create } from 'zustand';

import type { ChildRecord } from '@/features/children/types';

export interface ChildState {
  readonly children: readonly ChildRecord[];
  saveChildren: (children: readonly ChildRecord[]) => void;
}

export const useChildStore = create<ChildState>()((set) =>
  ({
    children: [],
    saveChildren: (children) =>
      set((state) => {
        const savedById = new Map(state.children.map((child) => [child.id, child]));
        for (const child of children) {
          savedById.set(child.id, child);
        }
        return { children: Array.from(savedById.values()) };
      }),
  }),
);
