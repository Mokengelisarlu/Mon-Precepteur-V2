# Project Overview — Mon Précepteur V2

> Context file 1 of 6 (core context system).
> Companion documents: `context/architecture.md`, `context/business-rules.md`, `context/ui-context.md`,
> `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.
> UI/UX source of truth: `design.md` (repository root). Roadmap: `context/step-features.md`.

---

## 1. Product Vision

**Mon Précepteur** is a mobile-first educational-support platform for the Democratic Republic of the Congo.

The client describes a learning need or, for a parent, the child's learning context. Mon Précepteur
takes care of everything else: analysing the request, selecting a suitable tutor, presenting a
service proposal, producing the contract and invoice, collecting payment through Mobile Money,
verifying it, and assigning the tutor.

The product is deliberately **not** a public tutor marketplace. The client never browses dozens of
tutor profiles, never compares them, and never has to organize the service himself. The client
makes one decision — accept or reject the proposal — and Mon Précepteur runs the operational chain.

### Vision statement

> Un parent ou un adulte décrit son besoin. Nous trouvons, contractualisons et affectons le bon
> précepteur. Le client n'a qu'une chose à faire : confirmer.

---

## 2. Problem Being Solved

In the DRC, finding a reliable private tutor is a **trust and coordination problem**, not a
supply problem. Tutors exist, but:

- **Discovery is offline and opaque.** Families rely on word of mouth; quality is unverified.
- **Requirements are never written down.** "Improve maths in 6th grade" is not a spec that can be
  matched to a tutor or priced.
- **The administrative chain is entirely manual and error-prone.** Agreement, price, payment proof
  and assignment live in notebooks, WhatsApp threads and paper receipts.
- **Payment is cash-and-trust.** Mobile Money is widely used but there is no structured way to
  declare, verify and receipt a transaction.
- **Coordination costs fall on the least-equipped party.** The parent — often with limited time,
  limited literacy in administrative processes, and limited technical confidence — ends up chasing
  tutors, chasing payment confirmations and chasing receipts.

Mon Précepteur converts that whole chain into a single guided mobile workflow that ends in a
verifiable, receipted service assignment.

---

## 3. Target Users

### 3.1 Parent / guardian (primary persona)

| Aspect | Detail |
|---|---|
| Context | Has one or more children in primary or secondary school in the DRC |
| Goal | Get reliable, structured academic support without juggling the logistics |
| Has | A phone number, a Mobile Money account, limited time |
| Needs | Register one child per request, describe the child's learning context, receive a clear proposal, sign, pay, know who the tutor is and when they come |
| Constraint | May have low technical confidence; must never feel "administratively overwhelmed" |

Capabilities in the product: register multiple children in the client profile over time, start a
separate request for each child, submit the child's guided learning context, track progress,
view/respond to proposals, review and sign contracts, view invoices and receipts, declare a Mobile
Money payment, and view the assigned tutor and agreed terms. The current child request flow does
not create `LearningNeed` records; preparing proposals for those context-only requests is deferred
until the admin workflow is decided (R-41). Additional-child profile management is planned for S13;
the initial request journey collects exactly one child.

### 3.2 Adult learner (secondary persona)

An adult seeking tutoring, language training, exam preparation or professional skills for
themselves. They skip child registration entirely and describe personal learning needs (subject,
level, objective, frequency, session length, availability, preferred format). They follow the exact
same proposal → contract → payment → assignment workflow.

### 3.3 Administrator / back-office operator (internal)

Reviews incoming requests, analyses needs, selects tutors, prepares proposals, contracts and
invoices, verifies declared payments, issues receipts, assigns tutors, maintains the activity
history. **In the first prototype this role is simulated locally** — it is a set of in-app admin
screens operating on the same local store, clearly labelled as a simulation.

### 3.4 Tutor (not a user in this prototype)

Tutors exist in the data model (catalogue, availability, subjects) but have **no application of
their own in V2**. Their relationship with Mon Précepteur is governed by a separate agreement that
is out of scope for this prototype.

---

## 4. Core Business Model

Mon Précepteur is a **managed service intermediary**, not a listing site.

**Revenue model (assumed for modelling only, not implemented):** Mon Précepteur sources, contracts
and guarantees the tutor, then sells a service package (subjects × frequency × duration × format)
to the client. The margin is the difference between the price paid to the tutor and the price
charged to the client. Pricing is set by the administrator per proposal — there is no public price
grid and no automated quoting in the prototype.

**What Mon Précepteur sells:** certainty. One number, one tutor, one contract, one verified
payment, one receipt.

### 4.1 The managed workflow (the core of the product)

1. Client submits a request (child learning context or adult learning needs, plus contact details).
2. Mon Précepteur analyses the request.
3. The team identifies suitable tutors.
4. The client receives a service proposal.
5. The client accepts or rejects the proposal.
6. A contract is generated and signed.
7. An invoice is generated.
8. The client pays via Mobile Money.
9. An administrator **manually verifies** the payment.
10. Required administrative checks complete; the tutor is assigned.
11. The educational service begins.

Steps 1, 5, 6 (view/sign), 8 (declare) and 11 are client-facing. Steps 2, 3, 7, 9, 10 are
administrator-facing.

### 4.2 Deliberate business constraints

- **One primary action per screen.** The client is guided, never asked to fill in an administrative
  form.
- **No public tutor browsing.** The tutor catalogue is an internal instrument; the client sees only
  the tutor proposed to them and the tutor assigned to them.
- **No auto-confirmation of payment.** A declared Mobile Money transaction is *pending* until a
  human verifies it against the operator. The system must never treat a transaction ID as proof.
- **Payment is not the only gate.** Verification of payment is necessary but not sufficient; other
  administrative checks may also be required before a tutor is assigned (see
  `context/business-rules.md` §5).
- **Needs, not children, are the unit of assignment.** One child may end up with two tutors for two
  subjects; one tutor may cover several needs.

---

## 5. Main User Journeys

### 5.1 Client journey (primary)

```
Welcome
  → Request type (bottom sheet: For my child | For myself)
      ├─ For my child → Child details and learning context → Parent contact → PIN → Review & submit
      └─ For myself   → Adult needs → Contact → PIN → Review & submit
  → Top success toast → Client dashboard
      → Proposal (view → accept / reject)
      → Contract (view → simulated signature)
      → Invoice → Mobile Money declaration → "Pending verification"
      → Receipt (after admin verification)
      → Assigned tutor(s)
  → Notifications
```

### 5.2 Administrator journey (simulated)

```
Admin dashboard (incoming requests)
  → Request detail (client, child or learner, learning context and any needs)
  → Proposal builder (eligible needs, tutor, price, frequency, duration, conditions) → send
  → Contract preparation → issue → client signs
  → Invoice preparation → issue
  → Payment verification (confirm / reject with reason) → receipt issued
  → Tutor assignment (per need)
  → Activity history
```

### 5.3 Journey invariants

- The client can always return to the dashboard from any step of their request.
- No step can be reached in an invalid state (guarded by the state machine in
  `context/business-rules.md`).
- Every administrative action that affects the client creates an in-app notification.

---

## 6. MVP Scope (first prototype — no backend)

### 6.1 In scope

| Area | Included |
|---|---|
| Onboarding | Welcome, request-type selection (bottom sheet) |
| Child journey | One-child-per-request onboarding with learning context; no client-created `LearningNeed` records. Child proposal preparation is deferred under R-41. Child profile management is deferred to S13. |
| Adult journey | Adult learning-need form (no child registration) |
| Contact | Two-step parent/adult form: name, phone (primary identifier), optional email; then required structured address (DRC city, commune, quartier, avenue and number) |
| Access | PIN creation + confirmation, salted-hash local storage, in-app unlock |
| Submission | Review screen, local submission, local request ID, top success toast and direct dashboard navigation |
| Client dashboard | Request status hub, child + needs, next step, proposal, contract, invoice, payment, tutor |
| Proposal | Admin builder, client view, accept / reject |
| Contract | Admin preparation, client view, simulated electronic signature |
| Invoice | Admin creation with unique number, client view, status |
| Payment | Mobile Money declaration form (transaction ID, payer phone, amount, operator, date, optional evidence), duplicate-ID detection, pending-verification state |
| Verification | Admin confirm / reject with reason |
| Receipt | Generated **only** after payment confirmation |
| Tutor | Internal catalogue, admin assignment per need, client view of assigned tutor |
| Notifications | In-app only, unread badge, generated by domain events |
| Persistence | AsyncStorage, versioned keys, restoration after app restart |
| Localization | EN + FR dictionaries, FR default, typed so FR must cover every EN key |
| Admin simulation | Clearly labelled as a simulation; operates on the same local store |

### 6.2 Explicitly out of scope

- Real backend, API, server, cloud sync, offline sync/merge.
- Real authentication (the PIN is a prototype demonstration, not a credential).
- Mobile Money operator integration or automatic transaction verification.
- SMS, WhatsApp, email or push delivery of any kind.
- Legally reliable electronic signature.
- The tutor's own application; tutor-side contract and availability management.
- Public tutor directory, ratings, reviews, chat, comments.
- Public pricing, automated quotation, coupons, referrals.
- Scheduling calendar, recurring-session calendar, in-app messaging.
- Partial payments, refunds, instalments, late-payment penalties (documented only, see risk
  register).
- Native app store release, EAS builds, OTA updates, analytics, crash reporting.
- Admin UI in English for the first prototype (French only — see `context/ui-context.md` §8).

---

## 7. Features Excluded from the MVP — and why

| Excluded feature | Reason |
|---|---|
| Real backend | The brief mandates a local-only prototype; a server would not prove the journey |
| Real authentication | Phone + PIN identity is simulated; real auth needs a server, OTP and rate limiting |
| Mobile Money API | No operator API is available; manual verification is the intended real-world model too |
| E-signature service | Legal validity must be validated by a DRC-qualified professional before production |
| Tutor app | The tutor is a party to a separate agreement with Mon Précepteur, out of scope |
| Multi-currency | The prototype uses a single currency (USD) with a documented constant |
| Partial payment / refund | Requires a financial ledger design; deferred with a documented decision |
| Push notifications | Requires a notification service and device tokens; in-app notifications suffice for the prototype |

---

## 8. Product Success Criteria

The prototype succeeds when:

1. **The adult journey is possible end to end**, with no dead ends: request → proposal → contract
   → invoice → declaration → verification → receipt → tutor assigned → service started. The parent
   journey currently completes request submission and dashboard routing; child proposal preparation
   is deferred under R-41 because the approved client flow creates no `LearningNeed` records.
2. **Every state is reachable and observable** — each status in `context/business-rules.md` can be
   reached, is displayed with a consistent label, and has a defined next step.
3. **Data survives an app restart** — the request, its status, the proposal, the payment and the
   receipt are all restored exactly.
4. **The multi-entity model works** — a parent can create separate requests for different children;
   adult requests carry one or more request-scoped needs, and tutor assignment remains per need.
5. **The journey is completable on a small screen** (e.g. 360×640 dp) and is operable by a user
   who has never used the app before.
6. **Both languages are complete** for every client-facing string; switching language changes all
   visible copy with no hardcoded leftovers.
7. **No simulated action is presented as a real one** — every mock boundary is labelled in the UI
   and in the documentation.
8. **Type safety and quality gates pass**: `tsc --noEmit` clean, lint clean, the automated test
   suite in `context/test-plan.md` green.

Non-goals for the prototype: production readiness, performance tuning at scale, legal compliance,
real money movement.

---

## 9. Important Business Rules (summary)

The authoritative, detailed version lives in `context/business-rules.md`. The rules that must never
be violated during implementation:

| # | Rule |
|---|---|
| BR-01 | The phone number is the primary client identifier and is unique per client. |
| BR-02 | A client may have many requests over time; a request belongs to exactly one client. |
| BR-03 | A parent request contains exactly one child **or** an adult request belongs to the client as the learner. It never contains both. |
| BR-04 | A child belongs to a client profile and may be referenced by several requests. |
| BR-05 | A `LearningNeed` belongs to one request. Adult requests create at least one; child onboarding submits learning context without creating client-side `LearningNeed` records. |
| BR-06 | One child may have several needs; a need may be covered by one proposal; a proposal may cover several needs. |
| BR-07 | Tutor assignment is **per need**. Multiple tutors per child and one tutor per several needs are both supported. |
| BR-08 | A client preference to reuse the same tutor is a preference, never a guarantee. |
| BR-09 | A PIN is never stored in plain text. The prototype stores a salted SHA-256 hash only, and this is explicitly **not** production authentication. |
| BR-10 | A declared payment is `pending_verification`. Only an administrator confirmation moves it to `confirmed`. |
| BR-11 | A receipt exists only for a `confirmed` payment. |
| BR-12 | A duplicate transaction ID is flagged and must not be silently accepted. |
| BR-13 | The payer's phone number may differ from the client's phone number. |
| BR-14 | Request status, proposal status, contract status, invoice status, payment status and tutor-assignment status are **separate** fields. They are never merged into one overloaded status. |
| BR-15 | Every administrative transition writes an activity event (who, what, from, to, when). |
| BR-16 | A proposal rejection does not close the request: the client may receive a new proposal. |
| BR-17 | For a minor, the contracted party is Parent/Guardian ↔ Mon Précepteur. The tutor's own agreement with Mon Précepteur is a separate document. |
| BR-18 | The invoice is issued after proposal acceptance; the contract may be issued in parallel with the invoice. |
| BR-19 | The request is only considered closed when the service is completed or explicitly cancelled. |
| BR-20 | Contract wording is a placeholder. Legal terms must be validated by a qualified professional in the DRC before any production use. |

---

## 10. Constraints Carried Forward From the Repository Audit

Recorded in full in `context/risk-register.md` and `context/architecture.md` §9. Summary:

- The repository `/home/anaclet/workspace/Dev/precepteur` was **completely empty** at the start of
  this planning phase (0 files, no Git repository). Every file listed in this context system is new.
- A sibling project, `/home/anaclet/workspace/Dev/m3e-test`, is an **earlier prototype of this same
  product** ("Mon Précepteur", slug `mon-precepteur`). It is a valuable reference for the brand
  palette, the app configuration, the storage conventions and the children feature. It is **not**
  copied blindly: V2 changes navigation (Expo Router), styling (NativeWind instead of
  react-native-paper), validation (Zod instead of hand-rolled) and state (Zustand instead of React
  Context).
- The workspace convention for this family of projects places the context system in `context/`,
  `AGENTS.md` at the repository root, and the design document at the repository root.
- Expo SDK **57** is the target (all four sibling Expo apps in the workspace run SDK 57; SDK 58 was
  two days old at the time of planning).

---

## 11. Out of Scope of This Document

This document describes **what** the product is. It does not describe how it is built — see
`context/architecture.md`. It does not describe the pixels — see `design.md`. It does not describe
the order of implementation — see `context/step-features.md`.
