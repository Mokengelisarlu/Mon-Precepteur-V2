import { create } from 'zustand';

import type { Notification } from '@/features/notification/types';

export interface NotificationState {
  readonly notifications: readonly Notification[];
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
}));
