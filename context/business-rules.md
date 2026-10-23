# Business Rules & State Transitions — Mon Précepteur V2

> Context file (extension of the six-file core system).
> Companion documents: `context/project-overview.md` (§9 summarises these rules),
> `context/architecture.md` (§7 defines the entities these rules operate on),
> `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`,
> `context/progress-tracker.md`.
> UI/UX source of truth: `design.md`.

This document is the **authoritative specification of state and validation**. Screens, services and
stores must not invent behaviour that contradicts it.

---

## 1. Principles

1. **Statuses are separate per entity.** The request's status, the proposal's status, the contract's
   status, the invoice's status, the payment's status and the assignment's status are six
   independent fields with six independent state machines (BR-14).
2. **The request status is a workflow phase, not a mirror.** A request can legitimately be
   `awaiting_payment` while the invoice is `awaiting_payment` and a *rejected* payment sits on
   record. The request status summarises *where the managed workflow is*, never *what one entity's
   status is*.
3. **Every transition is guarded.** An invalid transition returns `INVALID_TRANSITION` and changes
   nothing.
4. **Every transition is attributed.** Each transition writes an `ActivityEvent` with an actor.
5. **Every client-visible transition creates a notification.**

---

## 2. Request Lifecycle

### 2.1 Status values

| Status | i18n key (FR label) | Meaning | Terminal |
|---|---|---|---|
| `received` | `request.status.received` | Demande reçue — submitted, not yet analysed | No |
| `under_review` | `request.status.under_review` | En cours d'analyse — the team is studying the needs | No |
| `proposal_sent` | `request.status.proposal_sent` | Proposition envoyée — awaiting the client's decision | No |
| `proposal_accepted` | `request.status.proposal_accepted` | Proposition acceptée | No |
| `proposal_rejected` | `request.status.proposal_rejected` | Proposition refusée — the client may receive a new proposal | No |
| `contract_signed` | `request.status.contract_signed` | Contrat signé | No |
| `awaiting_payment` | `request.status.awaiting_payment` | En attente de paiement | No |
| `payment_verified` | `request.status.payment_verified` | Paiement vérifié | No |
| `in_service` | `request.status.in_service` | Service en cours | No |
| `completed` | `request.status.completed` | Service terminé | Yes |
| `on_hold` | `request.status.on_hold` | En pause | No |
| `cancelled` | `request.status.cancelled` | Annulée | Yes |

### 2.2 Transitions

| # | From | To | Trigger | Actor | Client-visible result | Guard |
|---|---|---|---|---|---|---|
| T-01 | — | `received` | The client submits the request | client | Confirmation screen + `request_received` notification | ≥ 1 need; contact complete; PIN set |
| T-02 | `received` | `under_review` | The administrator opens the request for analysis | admin | "We are reviewing your request" | — |
| T-03 | `under_review` | `proposal_sent` | The administrator sends a proposal | admin | Proposal becomes visible + `proposal_sent` notification | The proposal covers ≥ 1 need of the request |
| T-04 | `proposal_sent` | `proposal_accepted` | The client accepts the proposal | client | "Proposal accepted" + `proposal_accepted` notification | The proposal's status is `sent` |
| T-05 | `proposal_sent` | `proposal_rejected` | The client rejects the proposal | client | "Proposal declined" + `proposal_rejected` notification | The proposal's status is `sent` |
| T-06 | `proposal_rejected` | `under_review` | The administrator prepares a new proposal | admin | The dashboard shows "we are revising your proposal" | — |
| T-07 | `proposal_sent` | `under_review` | The administrator withdraws or revises the proposal | admin | The proposal is marked withdrawn | The proposal's status is `sent` |
| T-08 | `proposal_accepted` | `contract_signed` | The client signs the contract | client | "Contract signed" + `contract_signed` notification | The contract's status is `issued` |
| T-09 | `contract_signed` | `awaiting_payment` | The administrator issues the invoice | admin | "Invoice ready" + `invoice_issued` notification | The contract is `signed` |
| T-10 | `awaiting_payment` | `payment_verified` | The administrator confirms a declared payment | admin | "Payment verified" + `payment_confirmed` + `receipt_issued` notifications | The payment's status is `pending_verification` |
| T-11 | `payment_verified` | `in_service` | The administrator activates a tutor assignment | admin | "Your tutor is assigned" + `tutor_assigned` + `service_started` notifications | ≥ 1 assignment for the request |
| T-12 | `in_service` | `completed` | The administrator closes the service | admin | "Service completed" | — |
| T-13 | any non-terminal | `on_hold` | The administrator pauses the request | admin | "Your request is on hold" | — |
| T-14 | `on_hold` | *(previous status)* | The administrator resumes the request | admin | The previous phase is restored | The previous status is remembered in the event log |
| T-15 | any non-terminal | `cancelled` | The client or administrator cancels | client/admin | "Request cancelled" | — |

### 2.3 Invalid transitions (explicitly rejected)

- `received` → `proposal_sent` without passing through `under_review`.
- `proposal_sent` → `contract_signed` (the client must accept the proposal first).
- `contract_signed` → `payment_verified` without an invoice and a confirmed payment.
- `awaiting_payment` → `payment_verified` when the payment status is `rejected` or `pending_verification`.
- Any transition out of `completed` or `cancelled` (both are terminal).
- `payment_verified` → `in_service` when no tutor assignment exists for any need of the request.

### 2.4 Side effects of a request transition

Every request transition performs, in this order:

1. Validate the guard.
2. Update `request.status` and `request.updatedAt`.
3. Write an `ActivityEvent` (`entityType: 'request'`, `fromStatus`, `toStatus`, `actor`).
4. Create the corresponding `Notification(s)`.
5. Persist the affected collections.

Steps 3–5 happen for **every** transition, including rejections and cancellations.

---

## 3. Proposal Lifecycle

### 3.1 Status values

| Status | i18n key | Meaning |
|---|---|---|
| `draft` | `proposal.status.draft` | Being prepared by the administrator |
| `sent` | `proposal.status.sent` | Sent to the client, awaiting a decision |
| `accepted` | `proposal.status.accepted` | Accepted by the client |
| `rejected` | `proposal.status.rejected` | Rejected by the client |
| `withdrawn` | `proposal.status.withdrawn` | Withdrawn by the administrator |
| `superseded` | `proposal.status.superseded` | Replaced by a newer proposal |

### 3.2 Transitions

| From | To | Trigger | Actor |
|---|---|---|---|
| — | `draft` | The administrator creates a proposal | admin |
| `draft` | `sent` | The administrator sends it to the client | admin |
| `sent` | `accepted` | The client accepts | client |
| `sent` | `rejected` | The client rejects (a reason is optional) | client |
| `sent` | `withdrawn` | The administrator withdraws it | admin |
| `draft` \| `sent` | `superseded` | A newer proposal replaces it | admin |

`accepted`, `rejected`, `withdrawn` and `superseded` are terminal for a given proposal.

### 3.3 Rules

- A proposal covers **one or more needs of one request** (BR-06).
- A proposal recommends **one tutor**, but the final assignment is made per need (BR-07). The
  administrator may assign a different tutor to a covered need; the proposal's recommendation is
  not binding.
- The price, frequency, session length, duration and conditions are mandatory before sending.
- A proposal cannot be sent if any of its needs is already covered by an `accepted` proposal
  (prevents double-billing for the same need).
- When a client rejects a proposal, the request moves to `proposal_rejected` (T-05) and **stays
  open** — it is not cancelled (BR-16).

---

## 4. Contract Lifecycle

### 4.1 Status values

| Status | i18n key | Meaning |
|---|---|---|
| `draft` | `contract.status.draft` | Being prepared |
| `issued` | `contract.status.issued` | Issued, awaiting the client's signature |
| `signed` | `contract.status.signed` | Signed by the client (simulated signature) |
| `active` | `contract.status.active` | In force |
| `void` | `contract.status.void` | Cancelled before or after signature |

### 4.2 Transitions

| From | To | Trigger | Actor |
|---|---|---|---|
| — | `draft` | The administrator creates the contract | admin |
| `draft` | `issued` | The administrator issues it to the client | admin |
| `issued` | `signed` | The client signs (simulated) | client |
| `signed` | `active` | The payment is verified | admin |
| `draft` \| `issued` \| `signed` | `void` | The administrator voids it (a reason is recorded) | admin |

### 4.3 Rules

- A contract references exactly one proposal and therefore one request.
- The contract is created **after** the proposal is accepted.
- **The signature is simulated.** The client types their name, which is stored as
  `clientSignatureName` together with `signatureSimulated: true` and a timestamp. The UI must state
  that this is a demonstration and not a legally valid electronic signature (BR-09, risk `R-09`).
- For a minor, the contracting parties are Parent/Guardian ↔ Mon Précepteur. The tutor's own
  agreement with Mon Précepteur is a **separate document** that is out of scope for this prototype
  (BR-17).
- The contract text is **placeholder wording**. It must not be presented as legally binding, and
  legal validation by a qualified professional in the DRC is required before production (BR-20,
  risk `R-08`).

---

## 5. Invoice Lifecycle

### 5.1 Status values

| Status | i18n key | Meaning |
|---|---|---|
| `draft` | `invoice.status.draft` | Being prepared |
| `awaiting_payment` | `invoice.status.awaiting_payment` | Issued, payment expected |
| `paid` | `invoice.status.paid` | A payment has been verified |
| `cancelled` | `invoice.status.cancelled` | Cancelled |

### 5.2 Transitions

| From | To | Trigger | Actor |
|---|---|---|---|
| — | `draft` | The administrator creates the invoice | admin |
| `draft` | `awaiting_payment` | The administrator issues it | admin |
| `awaiting_payment` | `paid` | The administrator confirms a declared payment | admin |
| `draft` \| `awaiting_payment` | `cancelled` | The administrator cancels it | admin |

### 5.3 Rules

- An invoice is created **after the proposal is accepted** (BR-18). The contract may still be
  unsigned when the invoice is issued; the workflow requires the contract to be signed before the
  request can reach `awaiting_payment` (T-09 follows T-08).
- The invoice number is unique and human-readable (`FAC-2026-0102`).
- The invoice carries the covered needs so the client can see what they are paying for.
- A rejected payment does **not** change the invoice status: it stays `awaiting_payment`, and the
  client may declare again (risk `R-05`).
- Partial payments are **not supported** in the prototype: the declared amount must be equal to the
  amount due. A mismatch is rejected at declaration time with a precise message (risk `R-04`).

---

## 6. Payment Lifecycle (Mobile Money)

### 6.1 Status values

| Status | i18n key | Meaning |
|---|---|---|
| `pending_verification` | `payment.status.pending_verification` | Declared by the client, not yet verified |
| `confirmed` | `payment.status.confirmed` | Verified by an administrator |
| `rejected` | `payment.status.rejected` | Verification failed; the client may declare again |
| `duplicate` | `payment.status.duplicate` | The transaction ID was already used — recorded for the audit trail |

### 6.2 Transitions

| From | To | Trigger | Actor |
|---|---|---|---|
| — | `pending_verification` | The client declares a transaction | client |
| — | `duplicate` | The client declares a transaction ID that already exists | client (automatic) |
| `pending_verification` | `confirmed` | The administrator verifies it against the operator | admin |
| `pending_verification` | `rejected` | The administrator rejects it (a reason is required) | admin |

`confirmed`, `rejected` and `duplicate` are terminal for a given payment. Reversing a confirmed
payment is **not** implemented (risk `R-04`).

### 6.3 Declaration rules

| # | Rule |
|---|---|
| P-01 | The client declares a transaction; the system never auto-confirms (BR-10). |
| P-02 | The declared amount must equal the invoice amount. A mismatch blocks the declaration. |
| P-03 | The payer's phone number may differ from the client's phone number (BR-13). It is stored as entered and normalised for display only. |
| P-04 | The transaction ID must be unique across all payments in the store. A duplicate creates a `duplicate` payment record for the audit trail and shows the client an explanatory error (BR-12). |
| P-05 | The payment date cannot be in the future and cannot be older than 90 days. |
| P-06 | Evidence is optional. When attached, only a local URI is stored — no upload, no server. |
| P-07 | Declaring a payment sets the invoice to `awaiting_payment` (if it was `draft`) and the request to `awaiting_payment` (T-09 does not re-fire; the status is already there). |
| P-08 | A rejected payment does not block a new declaration. The client may declare a new transaction for the same invoice. |

### 6.4 Verification rules

| # | Rule |
|---|---|
| V-01 | Only a payment in `pending_verification` can be confirmed or rejected. |
| V-02 | Confirming sets the invoice to `paid`, sets the request to `payment_verified` (T-10) and **creates the receipt** (BR-11). |
| V-03 | Rejecting requires a reason, keeps the invoice at `awaiting_payment`, and creates a `payment_rejected` notification for the client. |
| V-04 | A confirmation is recorded with `reviewedBy: 'admin_local'` and `reviewedAt`. |
| V-05 | The administrator's screen shows the declared transaction ID, amount, payer phone, operator and date **side by side with the invoice amount** so a mismatch is obvious. |

### 6.5 Additional checks before a tutor is assigned (BR-15, risk `R-06`)

Payment verification is **necessary but not sufficient**. Before the request may move to
`in_service`, the administrator confirms:

1. The payment is verified.
2. The contract is `signed`.
3. A tutor is assigned to **every** need of the request.
4. Any additional operational check defined by the team (e.g. the tutor's availability confirmed
   for the agreed slots, the tutor's own contract with Mon Précepteur in place).

Check 4 is a **placeholder checkbox** in the prototype, labelled as such, so the workflow can be
demonstrated end-to-end without inventing business rules.

---

## 7. Receipt Lifecycle

| From | To | Trigger | Actor |
|---|---|---|---|
| — | `issued` | An administrator confirms a payment | admin (automatic) |

- A receipt exists **only** for a `confirmed` payment (BR-11). There is no code path that creates a
  receipt for a `pending_verification`, `rejected` or `duplicate` payment.
- The receipt number is unique (`REC-2026-0077`).
- The receipt copies the amount and currency from the confirmed payment.

---

## 8. Tutor Assignment Lifecycle

| From | To | Trigger | Actor |
|---|---|---|---|
| — | `proposed` | The administrator suggests a tutor for a need | admin |
| `proposed` \| `assigned` | `assigned` | The administrator confirms the assignment | admin |
| `assigned` | `active` | The service starts (after §6.5 checks) | admin |
| `assigned` \| `active` | `cancelled` | The administrator cancels the assignment | admin |
| `active` | `completed` | The service ends | admin |

### 8.1 Rules

- An assignment targets **exactly one need** (BR-07).
- **Multiple assignments for the same need are forbidden** — one need has at most one *active*
  assignment. A cancelled assignment may be replaced by a new one.
- **One tutor may hold assignments for several needs** of the same or different requests.
- **One child may hold assignments with different tutors** for different needs.
- The client's "prefer the same tutor" preference is **advisory only** — it never prevents an
  administrator from assigning a different tutor (BR-08).

---

## 9. Client Session & PIN Rules

### 9.1 Session states

| State | Meaning |
|---|---|
| `anonymous` | No client profile exists yet |
| `locked` | A client profile exists; the PIN is required to enter the dashboard |
| `unlocked` | The client is inside the app |

### 9.2 PIN rules

| # | Rule |
|---|---|
| PIN-01 | The PIN is 4 digits (numeric), chosen by the client during the request flow. |
| PIN-02 | The PIN is **never stored in plain text**. A random 16-byte salt is generated with `expo-crypto`, and the stored value is `SHA-256(salt + ':' + pin)` as hex (`context/architecture.md` §1.1, AD-12). |
| PIN-03 | SHA-256 is fast, so a 4-digit PIN is theoretically brute-forceable. This is a **prototype demonstration, not production authentication**. The UI must state this. Production requires a server-side slow KDF (Argon2id/bcrypt/scrypt) plus rate limiting and lockout. |
| PIN-04 | The PIN confirms itself — the user types it twice and the two entries must match. |
| PIN-05 | A mismatch shows an inline error on the confirmation field and does not advance. |
| PIN-06 | The PIN is stored with the **client profile**, not with the request, so the client keeps access across requests. |
| PIN-07 | The PIN is never logged, never included in a notification body, and never included in an `ActivityEvent` note. |
| PIN-08 | Unlocking is simulated: the app compares the hash locally. There is no session token, no expiry and no server. |

---

## 10. Notification Rules

| # | Rule |
|---|---|
| N-01 | Notifications are generated by domain transitions, never written by hand from a screen. |
| N-02 | A notification is addressed to one client and may reference one request. |
| N-03 | Notifications store **i18n keys and parameters**, never rendered strings (AD-10). |
| N-04 | Notifications are **in-app only**. No SMS, no WhatsApp, no email, no push (out of scope for the prototype). The UI must not imply otherwise. |
| N-05 | The unread count is shown as a badge on the Notifications entry point. |
| N-06 | Reading a notification sets `readAt`. Reading never mutates the underlying domain entity. |

---

## 11. Validation Rules per Screen

All rules below are implemented as Zod schemas in `src/features/<domain>/types.ts` (or a sibling
`validation.ts`) and are reused both by the form and by the persistence reader.

### 11.1 Child form

| Field | Required | Rule | Message key |
|---|---|---|---|
| `firstName` | Yes | Trimmed, 1–60 characters, at least one letter | `validation.child.firstName` |
| `lastName` | No | Trimmed, 1–60 characters | `validation.child.lastName` |
| `yearOfBirth` | Yes | Four-digit year; derived age (current calendar year minus birth year) must be 3–25 | `validation.child.yearOfBirth` |
| `level` | Yes | Trimmed, 1–60 | `validation.child.level` |
| `school` | No | Trimmed, ≤ 80 | `validation.child.school` |
| `notes` | No | ≤ 500 | `validation.child.notes` |

Age is derived from the year of birth and the current calendar year. Month and day are not
collected, so this is an estimate rather than birthday-precise age.

### 11.2 Learning-need form

| Field | Required | Rule | Message key |
|---|---|---|---|
| `subject` | Yes | Trimmed, 2–80 | `validation.need.subject` |
| `level` | Yes | Trimmed, 1–60 | `validation.need.level` |
| `objective` | Yes | Trimmed, 5–400 | `validation.need.objective` |
| `frequency` | Yes | One of `weekly_1`, `weekly_2`, `weekly_3`, `monthly_1`, `flexible` | `validation.need.frequency` |
| `sessionMinutes` | Yes | One of 30 / 45 / 60 / 90 / 120 | `validation.need.sessionMinutes` |
| `availability` | Yes | Trimmed, 5–300 | `validation.need.availability` |
| `format` | Yes | `home` \| `online` \| `center` | `validation.need.format` |
| `location` | Conditional | Required when `format` is `home` or `center`; ≤ 120 | `validation.need.location` |
| `notes` | No | ≤ 500 | `validation.need.notes` |

### 11.3 Contact form

| Field | Required | Rule | Message key |
|---|---|---|---|
| `firstName` | Yes | Trimmed, 1–60 | `validation.contact.firstName` |
| `lastName` | Yes | Trimmed, 1–60 | `validation.contact.lastName` |
| `phone` | Yes | Normalised; 9–15 digits after normalisation; DRC prefixes accepted (`+243`, `0`) | `validation.contact.phone` |
| `email` | No | RFC-lite; must contain `@` and a dot | `validation.contact.email` |
| `address` | No | Trimmed, ≤ 120 | `validation.contact.address` |

### 11.4 PIN form

| Field | Required | Rule | Message key |
|---|---|---|---|
| `pin` | Yes | Exactly 4 digits | `validation.pin.format` |
| `pinConfirm` | Yes | Exactly 4 digits, identical to `pin` | `validation.pin.mismatch` |

### 11.5 Payment declaration form

| Field | Required | Rule | Message key |
|---|---|---|---|
| `transactionId` | Yes | Trimmed, 4–40 characters, `[A-Za-z0-9-]` only | `validation.payment.transactionId` |
| `payerPhone` | Yes | Same rule as `phone` | `validation.payment.payerPhone` |
| `amount` | Yes | Number > 0, **equal to the invoice amount** | `validation.payment.amountMismatch` |
| `operator` | Yes | One of the five operators | `validation.payment.operator` |
| `paidAt` | Yes | A valid date, not in the future, not older than 90 days | `validation.payment.paidAt` |
| `evidenceUri` | No | A local `file://` URI | — |

### 11.6 Admin forms

| Form | Required fields | Notes |
|---|---|---|
| Proposal | `needIds` (≥ 1), `tutorId`, `price` (> 0), `currency`, `billingCycle`, `frequency`, `sessionMinutes`, `durationLabel`, `conditions` | Cannot cover a need already covered by an accepted proposal |
| Contract | `proposalId`, `contractNumber`, `terms` | The number must be unique |
| Invoice | `proposalId`, `number`, `needIds` (≥ 1), `amount`, `issuedAt`, `dueDate` (optional) | The number must be unique; the amount derives from the proposal by default |
| Payment verification | `decision` (`confirmed` / `rejected`), `rejectionReason` (required when rejecting) | Confirmation additionally requires the extra checks of §6.5 |
| Assignment | `needId`, `tutorId` | The tutor must be active and support the need's subject and format |

---

## 12. Guard Summary (quick reference for implementers)

| Guard | Rule |
|---|---|
| G-01 | A request belongs to exactly one client. |
| G-02 | A submitted request has ≥ 1 need. |
| G-03 | A parent request has ≥ 1 child; an adult request has 0 children and ≥ 1 need with `learnerIsClient: true`. |
| G-04 | A proposal covers ≥ 1 need belonging to its own request. |
| G-05 | A need may not be covered by two accepted proposals simultaneously. |
| G-06 | A receipt exists only for a confirmed payment. |
| G-07 | A confirmed payment can never transition again. |
| G-08 | A transaction ID may not exist twice among non-`duplicate` payments. |
| G-09 | An active assignment exists at most once per need. |
| G-10 | An assignment's tutor must be active and must support the need's subject and format. |
| G-11 | The client must not have two profiles with the same phone number. |
| G-12 | An invoice number, contract number and receipt number are each unique. |
| G-13 | The request may not enter `in_service` unless every need has an active assignment and the payment is verified. |
| G-14 | The client may only decide on a proposal whose status is `sent` and which belongs to their own request. |
| G-15 | A client may only see and act on their own requests, proposals, contracts, invoices, payments and receipts. (In the prototype this is enforced by the UI, not by authentication — see risk `R-12`.) |
