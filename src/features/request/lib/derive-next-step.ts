import type { TranslationKey } from '@/lib/i18n/types';

import type { RequestStatus } from '../types';

export type NextStepAction =
  | 'review_proposal'
  | 'sign_contract'
  | 'pay_invoice'
  | 'declare_payment'
  | 'see_tutor';

export interface NextStepContext {
  readonly status: RequestStatus;
}

export interface NextStep {
  readonly titleKey: TranslationKey;
  readonly descriptionKey: TranslationKey;
  readonly action: NextStepAction | null;
}

const NEXT_STEPS: Record<RequestStatus, NextStep> = {
  received: {
    titleKey: 'dashboard.next.received',
    descriptionKey: 'dashboard.next.received.description',
    action: null,
  },
  under_review: {
    titleKey: 'dashboard.next.underReview',
    descriptionKey: 'dashboard.next.underReview.description',
    action: null,
  },
  proposal_sent: {
    titleKey: 'dashboard.next.proposalSent',
    descriptionKey: 'dashboard.next.proposalSent.description',
    action: 'review_proposal',
  },
  proposal_accepted: {
    titleKey: 'dashboard.next.proposalAccepted',
    descriptionKey: 'dashboard.next.proposalAccepted.description',
    action: null,
  },
  proposal_rejected: {
    titleKey: 'dashboard.next.proposalRejected',
    descriptionKey: 'dashboard.next.proposalRejected.description',
    action: null,
  },
  contract_signed: {
    titleKey: 'dashboard.next.contractSigned',
    descriptionKey: 'dashboard.next.contractSigned.description',
    action: null,
  },
  awaiting_payment: {
    titleKey: 'dashboard.next.awaitingPayment',
    descriptionKey: 'dashboard.next.awaitingPayment.description',
    action: 'pay_invoice',
  },
  payment_verified: {
    titleKey: 'dashboard.next.paymentVerified',
    descriptionKey: 'dashboard.next.paymentVerified.description',
    action: null,
  },
  in_service: {
    titleKey: 'dashboard.next.inService',
    descriptionKey: 'dashboard.next.inService.description',
    action: 'see_tutor',
  },
  completed: {
    titleKey: 'dashboard.next.completed',
    descriptionKey: 'dashboard.next.completed.description',
    action: null,
  },
  on_hold: {
    titleKey: 'dashboard.next.onHold',
    descriptionKey: 'dashboard.next.onHold.description',
    action: null,
  },
  cancelled: {
    titleKey: 'dashboard.next.cancelled',
    descriptionKey: 'dashboard.next.cancelled.description',
    action: null,
  },
};

export const NEXT_STEP_ACTION_LABEL_KEYS = {
  review_proposal: 'dashboard.action.reviewProposal',
  sign_contract: 'dashboard.action.signContract',
  pay_invoice: 'dashboard.action.payInvoice',
  declare_payment: 'dashboard.action.declarePayment',
  see_tutor: 'dashboard.action.seeTutor',
} as const satisfies Record<NextStepAction, TranslationKey>;

export function deriveNextStep(context: NextStepContext): NextStep {
  return NEXT_STEPS[context.status];
}
