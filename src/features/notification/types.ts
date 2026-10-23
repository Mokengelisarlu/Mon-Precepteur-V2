import type { TranslationKey } from '@/lib/i18n/types';

export interface Notification {
  readonly id: string;
  readonly clientId: string;
  readonly requestId: string;
  readonly type: 'request_received';
  readonly titleKey: TranslationKey;
  readonly bodyKey: TranslationKey;
  readonly params: Readonly<Record<string, string | number>>;
  readonly createdAt: number;
}
