import type { BadgeVariant } from '@/components/ui';
import type { TranslationKey } from '@/lib/i18n/types';

import type { RequestStatus } from '../types';

export const REQUEST_STATUS_LABEL_KEYS = {
  received: 'status.request.received',
  under_review: 'status.request.under_review',
  proposal_sent: 'status.request.proposal_sent',
  proposal_accepted: 'status.request.proposal_accepted',
  proposal_rejected: 'status.request.proposal_rejected',
  contract_signed: 'status.request.contract_signed',
  awaiting_payment: 'status.request.awaiting_payment',
  payment_verified: 'status.request.payment_verified',
  in_service: 'status.request.in_service',
  completed: 'status.request.completed',
  on_hold: 'status.request.on_hold',
  cancelled: 'status.request.cancelled',
} as const satisfies Record<RequestStatus, TranslationKey>;

export const REQUEST_STATUS_BADGE_VARIANTS = {
  received: 'info',
  under_review: 'info',
  proposal_sent: 'info',
  proposal_accepted: 'success',
  proposal_rejected: 'warning',
  contract_signed: 'success',
  awaiting_payment: 'warning',
  payment_verified: 'success',
  in_service: 'info',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
} as const satisfies Record<RequestStatus, BadgeVariant>;

export const REQUEST_TIMELINE_PHASES = [
  'received',
  'review',
  'proposal',
  'contract',
  'payment',
  'service',
] as const;

export type RequestTimelinePhase = (typeof REQUEST_TIMELINE_PHASES)[number];

export const REQUEST_TIMELINE_LABEL_KEYS = {
  received: 'dashboard.timeline.received',
  review: 'dashboard.timeline.review',
  proposal: 'dashboard.timeline.proposal',
  contract: 'dashboard.timeline.contract',
  payment: 'dashboard.timeline.payment',
  service: 'dashboard.timeline.service',
} as const satisfies Record<RequestTimelinePhase, TranslationKey>;

const TIMELINE_PHASE_INDEX: Record<RequestStatus, number> = {
  received: 0,
  under_review: 1,
  proposal_sent: 2,
  proposal_rejected: 2,
  proposal_accepted: 3,
  contract_signed: 4,
  awaiting_payment: 4,
  payment_verified: 5,
  in_service: 5,
  completed: 5,
  on_hold: -1,
  cancelled: -1,
};

export function timelinePhaseIndex(status: RequestStatus): number {
  return TIMELINE_PHASE_INDEX[status];
}
