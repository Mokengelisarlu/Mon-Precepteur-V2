import { create } from 'zustand';

import type { ClientProfile } from '@/features/client/types';

export interface ClientState {
  clients: readonly ClientProfile[];
  saveClient: (client: ClientProfile) => void;
}

export const useClientStore = create<ClientState>()((set) => ({
  clients: [],
  saveClient: (client) =>
    set((state) => ({
      clients: [
        ...state.clients.filter((existingClient) => existingClient.id !== client.id),
        client,
      ],
    })),
}));
