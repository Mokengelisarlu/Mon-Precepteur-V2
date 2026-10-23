import { create } from 'zustand';

import type { RequestRecord } from '@/features/request/types';

export interface RequestState {
  readonly requests: readonly RequestRecord[];
  saveRequest: (request: RequestRecord) => void;
}

export const useRequestStore = create<RequestState>()((set) => ({
  requests: [],
  saveRequest: (request) =>
    set((state) => ({
      requests: [
        ...state.requests.filter((existingRequest) => existingRequest.id !== request.id),
        request,
      ],
    })),
}));
