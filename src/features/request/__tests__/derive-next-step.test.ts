import {
  NEXT_STEP_ACTION_LABEL_KEYS,
  deriveNextStep,
  type NextStep,
} from '../lib/derive-next-step';
import type { RequestStatus } from '../types';

const EXPECTED: Readonly<Record<RequestStatus, NextStep>> = {
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

describe('deriveNextStep', () => {
  it.each(Object.entries(EXPECTED) as [RequestStatus, NextStep][])(
    'derives the next step for the %s status',
    (status, expected) => {
      expect(deriveNextStep({ status })).toEqual(expected);
    },
  );

  it('provides a label key for every dashboard action', () => {
    expect(NEXT_STEP_ACTION_LABEL_KEYS).toEqual({
      review_proposal: 'dashboard.action.reviewProposal',
      sign_contract: 'dashboard.action.signContract',
      pay_invoice: 'dashboard.action.payInvoice',
      declare_payment: 'dashboard.action.declarePayment',
      see_tutor: 'dashboard.action.seeTutor',
    });
  });
});
