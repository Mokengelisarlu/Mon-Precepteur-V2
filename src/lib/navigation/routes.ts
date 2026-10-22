export type ClientRoute =
  | '/welcome'
  | '/request-type'
  | '/children'
  | '/children/form'
  | '/needs/child/[childId]'
  | '/needs/self'
  | '/contact'
  | '/pin'
  | '/review'
  | '/submitted'
  | '/dashboard'
  | '/proposal/[proposalId]'
  | '/contract/[contractId]'
  | '/invoice/[invoiceId]'
  | '/payment/[invoiceId]'
  | '/receipt/[receiptId]'
  | '/tutor/[needId]'
  | '/notifications';

export type AdminRoute =
  | '/admin'
  | '/admin/request/[requestId]'
  | '/admin/proposal/new'
  | '/admin/contract/new'
  | '/admin/invoice/new'
  | '/admin/payment/[paymentId]'
  | '/admin/receipt/issue'
  | '/admin/assignment'
  | '/admin/history';

export const routes = {
  welcome: '/welcome' as const,
  requestType: '/request-type' as const,
  children: '/children' as const,
  childForm: '/children/form' as const,
  needsForChild: (childId: string) => `/needs/child/${childId}` as const,
  needsSelf: '/needs/self' as const,
  contact: '/contact' as const,
  pin: '/pin' as const,
  review: '/review' as const,
  submitted: '/submitted' as const,
  dashboard: '/dashboard' as const,
  proposal: (proposalId: string) => `/proposal/${proposalId}` as const,
  contract: (contractId: string) => `/contract/${contractId}` as const,
  invoice: (invoiceId: string) => `/invoice/${invoiceId}` as const,
  payment: (invoiceId: string) => `/payment/${invoiceId}` as const,
  receipt: (receiptId: string) => `/receipt/${receiptId}` as const,
  tutor: (needId: string) => `/tutor/${needId}` as const,
  notifications: '/notifications' as const,
  adminRoot: '/admin' as const,
  adminRequest: (requestId: string) => `/admin/request/${requestId}` as const,
  adminProposalNew: '/admin/proposal/new' as const,
  adminContractNew: '/admin/contract/new' as const,
  adminInvoiceNew: '/admin/invoice/new' as const,
  adminPayment: (paymentId: string) => `/admin/payment/${paymentId}` as const,
  adminReceiptIssue: '/admin/receipt/issue' as const,
  adminAssignment: '/admin/assignment' as const,
  adminHistory: '/admin/history' as const,
};
