# Test Plan — Mon Précepteur V2

> Context file (extension of the six-file core system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/code-standards.md`,
> `context/ai-workflow-rules.md`, `context/progress-tracker.md`.
> Roadmap: `context/step-features.md`.

**ID scheme:** `T-A##` = automated (Jest) · `T-M##` = manual (human). Every scenario in the brief's
test list is covered by at least one entry.

---

## 1. Test Levels and Tooling

| Level | Tool | Scope | When it runs |
|---|---|---|---|
| Unit | `jest-expo` | Domain services, state machines, Zod schemas, formatters, pure derivations | Every step |
| Component | `@testing-library/react-native` | Shared UI components, forms, state rendering | Every step that touches the UI |
| Integration | `jest-expo` | Store + persistence round-trips, multi-step workflow transitions | Every step that adds a transition |
| End-to-end | `jest-expo` + the store layer | The complete managed workflow, driven through the services | S25 |
| Manual | — | Usability, visual review, small screens, real device, honest labelling | S24, S25 and per step |

**Verification commands (must all pass before a step is complete):**

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # jest
```

---

## 2. Scenario Coverage Matrix

| Brief requirement | Scenario IDs | Type |
|---|---|---|
| Adult requests | T-A10, T-M01 | Automated + Manual |
| Parent requests | T-A01, T-M02 | Automated + Manual |
| One child per parent request with no client-created needs | T-A02, T-A03 | Automated |
| Different tutors for different needs | T-A04 | Automated |
| Form validation | T-A05 | Automated |
| Incomplete requests | T-A06 | Automated |
| Request submission and dashboard success | T-A27 | Automated |
| Two-step client contact and structured parent address | T-A28 | Automated |
| PIN confirmation errors | T-A07 | Automated |
| App restart and local data restoration | T-A08 | Automated + Manual |
| Proposal acceptance and rejection | T-A09 | Automated |
| Contract status transitions | T-A11 | Automated |
| Invoice generation | T-A12 | Automated |
| Missing or duplicate transaction IDs | T-A13 | Automated |
| Incorrect declared payment amounts | T-A14 | Automated |
| Payment rejection and resubmission | T-A15 | Automated |
| Receipt only after payment confirmation | T-A16 | Automated |
| Tutor assignment | T-A17 | Automated |
| Navigation and back behaviour | T-A18, T-M03 | Automated + Manual |
| English and French content | T-A19, T-M04 | Automated + Manual |
| Small mobile screens | T-M05 | Manual |
| Empty, loading, error, success states | T-A20, T-M06 | Automated + Manual |

---

## 3. Automated Scenarios

### 3.1 Request capture

**T-A01 — Parent request completes successfully**
*Given* a fresh app, *when* the client completes request type → child onboarding → both Contact
steps → PIN → review, *then* a request exists with status `received`, exactly one child, its
`learningContext`, `needIds: []`, a client profile with a hashed PIN and complete address, an
`ActivityEvent` and a `request_received` notification.

**T-A02 — One child per parent request**
*When* a parent submits a valid request, *then* it references exactly one child and no
client-created `LearningNeed` records. A draft containing multiple children is rejected; another
child must be handled in a separate request.

**T-A03 — Child learning context is preserved without creating needs**
*When* a parent submits the child onboarding context, *then* the context is stored on the request,
the request has an empty `needIds` array, and no child `LearningNeed` record is created.

**T-A04 — Different tutors for different needs**
*When* two needs of the same child are assigned to two different tutors, *then* the two
assignments coexist, the client sees two different tutors, and neither assignment is overwritten.

**T-A05 — Form validation**
*Then* every Zod schema rejects each invalid case with the expected key:
`firstName` empty; `yearOfBirth` not a four-digit year; a need
objective shorter than 5 characters; `location` missing when `format` is `home` or
`center`; unsupported need frequency, session length or format; phone
not a valid DRC number; accepted `+243`, `0` and local `8` forms normalize to the same canonical
phone; duplicate normalized phones offer the existing profile without creating another; email
malformed; each required address part missing; PIN not 4 digits; PIN confirmation mismatched; transaction ID with illegal characters;
`paidAt` in the future; `paidAt` older than 90 days.

**T-A06 — Incomplete request cannot be submitted**
*When* an adult request has no valid need, a child request has no child or learning context, or
either journey has no valid contact or PIN, *then* submission is rejected with a
`VALIDATION_FAILED` error and **no** request, event or notification is created. An empty child
`needIds` array alone is valid.

**T-A27 — Request submission and dashboard success**
*When* a complete parent or adult draft is submitted, *then* the request is stored with status
`received`, the first client `ActivityEvent` and `request_received` notification are stored, and
the draft is cleared. Adult needs reference the request; a parent request preserves its onboarding
context and creates no needs. The reference uses `MP-YYYY-NNNN`; success shows a toast and replaces
Review with the dashboard rather than opening the legacy confirmation route.

**T-A07 — PIN confirmation error**
*When* the PIN and the confirmation differ, *then* the confirmation field shows the mismatch error
and the flow does not advance; after correcting the confirmation, one press of Continue advances;
*and* the persisted state contains no plain-text PIN anywhere. When continuing with an existing
client profile, an incorrect PIN is rejected and the saved PIN hash and salt remain unchanged.

**T-A08 — App restart and local data restoration**
*When* the app is killed and relaunched, *then* the client, the children, the request, its
learning context and any adult needs,
the proposal, the contract, the invoice, the payment, the receipt, the assignments, the
notifications and the activity history are all restored identically; *and* the in-progress draft
is restored and the "continue your request" sheet appears.

**T-A10 — Adult request completes successfully**
*When* the adult journey completes, *then* the request has `type: 'self'`, no children, and at
least one need with `learnerIsClient: true`; *and* no `Child` record is created at any point.

**T-A24 — Request-type sheet selection**
*When* "Get started" is pressed, *then* the request-type sheet opens; selecting "For my child"
navigates to `/children` and stores `journeyType: 'child'`, while selecting "For myself" navigates
to `/needs/self` and stores `journeyType: 'self'`; *and* returning to Welcome and opening the sheet
again retains the in-memory selection; *and* back/Escape dismissal returns to Welcome.

**T-A25 — Child onboarding wizard**
*When* the parent completes the four steps of `/children`, *then* each "Continue" validates only
the current step, the wizard blocks a missing first name, birth year, gender, grade, estimated
level, subject, day or time slot, and "Finish" saves one `Child` record plus the onboarding
context; the app then opens Contact. Session duration and address are not fields in the child
wizard.

**T-A26 — Child onboarding keyboard and editing**
*When* a field near the bottom of the wizard is focused on Android or iOS, *then* the
`KeyboardAvoidingView` keeps the field and the footer above the keyboard. *When* `/children` is
opened with an existing `childId`, *then* the wizard restores the child and the saved onboarding
context.

**T-A28 — Two-step Contact form**
*When* either journey opens Contact, *then* step 1 collects last name, first name, phone and
optional email, and only advances when required identity fields are valid. Step 2 collects city,
commune, quartier, avenue and number; city defaults to Lubumbashi. Continuing stores the normalized
phone and composed full address on the client profile, including when continuing with an existing
profile. The toast host renders toasts below the top safe-area inset.

### 3.2 Proposals, contracts and invoices

**T-A09 — Proposal acceptance and rejection**
*When* the client accepts a `sent` proposal, *then* the proposal becomes `accepted`, the request
becomes `proposal_accepted`, an event is written and a notification is created; *and* when the
client rejects it with a reason, the proposal becomes `rejected`, the request becomes
`proposal_rejected`, **and the request remains open** (a new proposal can then be sent).

**T-A11 — Contract status transitions**
*Then* a contract can only be created from an accepted proposal; a contract can only be signed
when `issued`; signing stores `signatureSimulated: true`, the typed name and the timestamp; a
contract cannot be signed twice; an issued contract can be voided; a void contract cannot be
signed.

**T-A12 — Invoice generation**
*Then* an invoice can only be created from an accepted proposal; the amount defaults to the
proposal price; the number is unique; issuing it moves the request to `awaiting_payment`.

### 3.3 Payments, receipts and assignments

**T-A13 — Missing or duplicate transaction IDs**
*When* a transaction ID is empty or too short or contains illegal characters, the declaration is
rejected; *when* it duplicates an existing non-`duplicate` payment's ID, the declaration is
rejected **and** a payment record with status `duplicate` is created for the audit trail, and the
client sees an explanatory error.

**T-A14 — Incorrect declared payment amounts**
*When* the declared amount differs from the invoice amount, the declaration is rejected with the
`amountMismatch` message; *and* the declared amount is never silently corrected to the invoice
amount.

**T-A15 — Payment rejection and resubmission**
*When* the administrator rejects a payment, the payment becomes `rejected` with a reason, the
invoice stays `awaiting_payment`, the request stays `awaiting_payment`, the client is notified, and
the client may declare a new payment for the same invoice — which is accepted.

**T-A16 — Receipt only after payment confirmation**
*Then* confirming a payment creates exactly one receipt; *and* a payment that is `pending_verification`,
`rejected` or `duplicate` has **zero** receipts (asserted for each of the three statuses); *and* a
confirmed payment cannot transition again.

**T-A17 — Tutor assignment**
*Then* one tutor may hold assignments for several needs; several tutors may be assigned to one
child's different needs; a need may not have two active assignments; an inactive tutor, or one who
does not support the need's subject or format, cannot be assigned; the request reaches
`in_service` only when the payment is verified **and** every need has an active assignment.

### 3.4 Cross-cutting

**T-A18 — Navigation and back behaviour**
*Then* the back gesture and the header back button produce the same result; *and* an unknown
dynamic id renders the not-found state rather than throwing; *and* Login from Welcome opens the
explicit unavailable notice and returns home; *and* the admin simulation remains labelled on its
workspace.

**T-A19 — English and French content**
*Then* the FR dictionary contains every EN key with a non-empty value; *and* no user-facing string
exists outside the dictionaries (a source scan test); *and* `t()` interpolates parameters and
applies the correct plural form per locale; *and* past notifications re-render in the new language.

**T-A20 — Empty, loading, error and success states**
*Then* each screen has a render test for its empty state, its error state and its populated state;
*and* each async action has a loading state that disables its trigger.

### 3.5 Persistence

**T-A21 — Adapter parity**
The same store test suite runs against the memory adapter and the AsyncStorage adapter and passes
identically. This is the proof that the Step 13 adapter swap is non-invasive.

**T-A22 — Corrupt data recovery**
*When* a persisted record fails schema validation, it is dropped, the app still starts, and the
"some data could not be restored" notice is shown.

**T-A23 — Schema version mismatch**
*When* a collection is stored with an unknown schema version, it is discarded instead of being
parsed.

---

## 4. Manual Scenarios

| ID | Scenario | Method | Pass criteria |
|---|---|---|---|
| T-M01 | Adult journey | Walk through the whole adult flow on a device | No confusion, no dead ends, no child step |
| T-M02 | Parent journey | Walk through the whole parent flow with one child, onboarding context, and a complete parent address | Every step is understandable; no child-needs screen appears; Review shows context and submission routes to the dashboard with a top success toast |
| T-M03 | Navigation and back | Explore every route; press back everywhere | No trapped flow, no unexpected screen, no double-tap duplication |
| T-M04 | Bilingual review | Switch FR ↔ EN on every screen | All visible copy changes; no truncation; no mixed-language screen |
| T-M05 | Small screens | Run at 360×640 dp (and 320×568 if it renders) | Welcome and Login text fit or scroll; both Welcome actions remain reachable; the request-type sheet title and both choices fit and remain tappable; the four-step child onboarding and two-step Contact forms are safe-area-aware, their content scrolls without clipping, city defaults to Lubumbashi, required address fields are reachable above the keyboard, and every toast appears below the top safe-area inset |
| T-M06 | State review | Trigger every empty / loading / error / success state | Each state is intentional and explained, never a blank screen |
| T-M07 | Real device restart | Kill and relaunch on a physical device | Everything is restored; the "continue your request" sheet appears |
| T-M08 | Honesty review | Read every screen as a client | Every simulation is labelled: PIN, signature, payment verification, admin mode, notifications. No screen implies a real SMS, a real payment, or a legally valid signature. |
| T-M09 | Visual review | Compare each screen against `design.md` | Layout, hierarchy and copy match the specification |
| T-M10 | Accessibility pass | With TalkBack/VoiceOver and the font scale at 130 % | All controls are reachable and labelled; no content is clipped |
| T-M11 | Request-type sheet dismissal | Open the sheet; swipe it down and press system back / Escape | Each dismissal closes the sheet without navigating away from Welcome |

---

## 5. Regression Rules

- The full suite (`npm test`) must be green before **every** step is reported as complete.
- A step that changes a transition service must add or update the corresponding test in the same
  change.
- A step that adds an i18n key must add it to **both** dictionaries in the same change.
- A bug found in a manual scenario (T-M*) is converted into an automated test where it is
  automatable, so the same defect cannot return.

---

## 6. Coverage and Gaps

| Area | Coverage |
|---|---|
| State transitions | Every transition in `context/business-rules.md` §2–§8 has at least one positive test and, where invalid transitions exist, one negative test |
| Zod schemas | Every schema has a valid case and one case per rule |
| Pure helpers (`deriveNextStep`, formatters, reference generation, phone normalisation, PIN hashing) | Fully covered |
| Stores | Round-trip and error paths covered |
| UI components | Default, loading, disabled, empty, error states covered |
| Screens | Smoke render plus the primary happy path |
| Accessibility | Manual pass (T-M10) plus automated assertions on labels and roles |
| Visual regression | **Not covered** — no snapshot testing in the prototype; the manual review (T-M09) substitutes |
| Performance | **Not covered** — out of scope for a prototype with a few hundred records |
| Device coverage | Android is the primary target; iOS is verified only through Expo Go / web preview |
