import { create } from 'zustand';

import type { ActivityEvent } from '@/features/request/types';

export interface ActivityState {
  readonly events: readonly ActivityEvent[];
  addActivityEvent: (event: ActivityEvent) => void;
}

export const useActivityStore = create<ActivityState>()((set) => ({
  events: [],
  addActivityEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),
}));
