# Risk & Assumption Register — Mon Précepteur V2

> Context file (extension of the six-file core system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/code-standards.md`,
> `context/ai-workflow-rules.md`, `context/progress-tracker.md`.
> Roadmap: `context/step-features.md`.

This register records every **unresolved decision**, **assumption** and **risk** found during
planning. An assumption is never silently promoted to a confirmed product requirement: each row
states whether user approval is required and whether it blocks implementation.

**Status legend:** `Open` · `Proposed` (a decision is proposed and awaiting confirmation) ·
`Accepted` (approved by the user) · `Closed` (no longer applicable) · `Deferred` (deliberately
postponed).

---

## 1. Summary

| ID | Item | Type | Approval | Blocks | Status |
|---|---|---|---|---|---|
| R-01 | Request ownership and multiple requests per client | Decision | **Yes** | S07 | Proposed |
| R-02 | Learning needs are request-scoped, children are profile-scoped | Decision | **Yes** | S08 | Proposed |
| R-03 | A proposal may cover several needs | Decision | **Yes** | S16 | Proposed |
| R-04 | Partial payments and refunds are not supported | Decision | **Yes** | S19 | Proposed |
| R-05 | Duplicate Mobile Money transactions | Risk | **Yes** | S19 | Proposed |
| R-06 | Checks required before a tutor is assigned | Decision | **Yes** | S22 | Open |
| R-07 | Local data loss (no backup, no sync) | Risk | No | — | Accepted |
| R-08 | Contract wording is a placeholder | Risk | **Yes** (legal) | S17 | Open |
| R-09 | The electronic signature is simulated | Risk | No | — | Accepted |
| R-10 | PIN security in the prototype | Risk | No | — | Accepted |
| R-11 | Client notification channels | Decision | **Yes** | S23 | Proposed |
| R-12 | Privacy of children's information | Risk | **Yes** | Production | Open |
| R-13 | Semantic status colours are not part of the inherited MD3 palette | Decision | **Yes** | — | **Accepted (S02)** |
| R-14 | No final logo mark | Gap | No | — | Open |
| R-15 | Admin workspace is French-only in the prototype | Decision | **Yes** | S15 | Proposed |
| R-16 | Payment evidence attachment requires `expo-image-picker` | Decision | **Yes** | S19 | Open |
| R-17 | The prototype has no authentication and no access control | Risk | No | — | Accepted |
| R-18 | Migration from local storage to a backend | Risk | No | — | Deferred |
| R-19 | Currency is a fixed single currency (USD) | Decision | **Yes** | S16 | Proposed |
| R-20 | The tutor-preference control applies to the adult journey | Decision | No | S09 | Proposed |
| R-21 | Local schema upgrades discard data instead of migrating | Decision | No | S14 | Proposed |
| R-22 | The repository had no Git history and no prior documentation | Audit fact | No | — | Closed |
| R-23 | The target dependency manifest had to be adjusted for SDK 57 | Risk | **Yes** | — | Proposed |
| R-24 | SDK 57 changed the app-configuration schema | Audit fact | No | — | Closed |
| R-25 | S02 scope: shadow tokens, deferred `DateField`/`Attachment`, `ToastHost` in S04 | Decision | **Yes** | — | **Accepted (S02)** |

---

## 2. Detailed Entries

### R-01 — Request ownership and multiple requests per client

- **Description:** Should a client profile be created before the request, or derived from it? And
  can a client have several requests at once?
- **Impact:** Determines whether a client can be recognised on a second request, whether the
  dashboard shows one request or many, and how the PIN is attached.
- **Proposed decision:** The `Client` profile is created at the contact step and identified by the
  phone number (BR-01). A client may have **many requests over time**, and the dashboard lists
  them (BR-02). The PIN belongs to the profile, so the client keeps access across requests.
- **Approval required:** Yes — it affects the dashboard and the contact step.
- **Blocks implementation:** Yes, from S07 onward.
- **Status:** Proposed.

### R-02 — Learning needs are request-scoped; children are profile-scoped

- **Description:** Does a learning need belong to the child (reusable) or to the request
  (one-off)? The brief says one child has many needs and one request has many children, without
  saying which entity owns a need.
- **Impact:** Determines whether re-submitting a similar need duplicates it, and whether the
  proposal → contract → invoice → assignment chain resolves to a request or to a child.
- **Proposed decision:** `Child` is **profile-scoped** (a parent registers children once and reuses
  them across requests). `LearningNeed` is **request-scoped** (it is an analysed requirement *of a
  request*). Consequence: re-submitting a similar need re-enters it rather than copying it. The
  child's identity and school details are never re-typed.
- **Alternative considered:** Needs as child-scoped — rejected because it breaks request-level
  pricing, contract scope and per-need assignment.
- **Approval required:** Yes.
- **Blocks implementation:** Yes, from S08.
- **Status:** Proposed.

### R-03 — A proposal may cover several needs

- **Description:** Can one proposal address multiple needs (and one tutor), or must every need
  have its own proposal?
- **Impact:** Determines the proposal builder's shape, the price model (one bundle vs per need) and
  whether a parent with maths + English gets one tutor or two.
- **Proposed decision:** A proposal covers **one or more needs** of a single request and recommends
  **one tutor** (BR-06). The final assignment remains **per need** (BR-07), so an administrator may
  assign a different tutor to one of the covered needs. Guard G-05 prevents two accepted proposals
  from covering the same need.
- **Approval required:** Yes — this is a commercial-model decision.
- **Blocks implementation:** Yes, from S16.
- **Status:** Proposed.

### R-04 — Partial payments and refunds

- **Description:** What happens if the client pays less than the invoice amount, or wants a
  refund after a confirmation?
- **Impact:** Affects the amount validation, the invoice status model, the receipt model and the
  admin verification screen.
- **Proposed decision:** The prototype supports **no partial payments and no refunds**. The declared
  amount must equal the invoice amount exactly (P-02); a mismatch is rejected with a precise
  message. A confirmed payment cannot transition again — there is no "un-confirm" path. Production
  needs a proper ledger with instalments, refunds and reconciliation.
- **Approval required:** Yes.
- **Blocks implementation:** Yes, from S19.
- **Status:** Proposed.

### R-05 — Duplicate Mobile Money transactions

- **Description:** A client (or an honest mistake) can declare a transaction ID that has already
  been used, and a fraudulent declaration must not be accepted as a second payment.
- **Impact:** A double-payment could mark an invoice as paid twice, or a client could be asked to
  pay for a service already covered.
- **Proposed decision:**
  1. The **client's own** duplicate is detected before the declaration is accepted: the payment is
     rejected with an explanatory error, **and** a payment record with status `duplicate` is written
     for the audit trail (P-04). The duplicate record is excluded from the duplicate index.
  2. The **administrator** sees a duplicate warning during verification when the transaction ID
     appears on another payment (V-05 / §6.5).
  3. The check is local in the prototype. Production needs a server-side, transactional uniqueness
     constraint across all clients.
- **Approval required:** Yes — confirm the "record the attempt, then reject" behaviour.
- **Blocks implementation:** Yes, from S19.
- **Status:** Proposed.

### R-06 — Checks required before a tutor is assigned

- **Description:** The brief says the workflow "should not treat payment verification as the only
  possible operational requirement". Which other checks are genuinely required?
- **Impact:** Determines the final gate before the service starts, and whether the prototype can
  demonstrate the complete workflow.
- **Proposed decision:** Four checks (see `context/business-rules.md` §6.5):
  1. The payment is verified.
  2. The contract is `signed`.
  3. A tutor is assigned to every need.
  4. An additional operational check, modelled as an explicitly labelled **placeholder checkbox**
  in the prototype, so the workflow is demonstrable without inventing business rules.
  The real content of check 4 (tutor availability confirmation, the tutor's own contract with Mon
  Précepteur, etc.) is a business decision for the team.
- **Approval required:** Yes — the maintainer must specify the real content of check 4.
- **Blocks implementation:** Partially — S22 can be built with the placeholder, but the production
  rule is still open.
- **Status:** Open.

### R-07 — Local data loss

- **Description:** All data lives in AsyncStorage on the device. Clearing the app's data, changing
  the device or reinstalling deletes every request, contract and receipt.
- **Impact:** Total loss of the client's history and of any receipt the client may need as proof.
- **Proposed decision:** Accept for the prototype, and be explicit in the UI that the prototype
  stores data only on the device. Mitigation already in place: receipts carry a unique number and
  the client can screenshot them; a "copy receipt number" action is a candidate for a future step.
  Production requires a server-side copy of every receipt and invoice.
- **Approval required:** No — inherent to the "no backend" constraint.
- **Blocks implementation:** No.
- **Status:** Accepted.

### R-08 — Contract wording is a placeholder

- **Description:** The contract text used in the prototype is illustrative. It has not been
  reviewed by a lawyer.
- **Impact:** Using the prototype's wording in production could create legal exposure, particularly
  for the Parent/Guardian ↔ Mon Précepteur relationship for a minor.
- **Proposed decision:** The contract screen labels the terms explicitly as placeholder wording
  requiring legal validation, and the code carries the `terms` content in a single place
  (`src/features/contract/`) so it can be replaced wholesale. Legal validation by a qualified
  professional in the DRC is **required before production** (BR-20).
- **Approval required:** Yes — from the legal owner, before any production use.
- **Blocks implementation:** No (the prototype is explicitly labelled).
- **Status:** Open.

### R-09 — The electronic signature is simulated

- **Description:** The client "signs" by typing their name. This has no legal standing.
- **Impact:** A contract could be mistakenly treated as signed in a real dispute.
- **Proposed decision:** The prototype stores `signatureSimulated: true` alongside the typed name
  and the timestamp, and the UI states plainly that this is a demonstration of the flow and not a
  legally valid electronic signature. Production requires an e-signature service with identity
  verification (or an in-person signature), subject to the same legal review as R-08.
- **Approval required:** No for the prototype; Yes before production.
- **Blocks implementation:** No.
- **Status:** Accepted.

### R-10 — PIN security in the prototype

- **Description:** A 4-digit PIN hashed with SHA-256 is fast to brute-force. The hash also lives on
  the device, next to the data it protects.
- **Impact:** In the prototype, the PIN protects nothing meaningful — there is no server, no
  sensitive data and no privilege separation. A real deployment with this scheme would be
  trivially bypassed.
- **Proposed decision:** The prototype satisfies "never store a PIN in plain text" (BR-09) using a
  16-byte random salt and SHA-256 via `expo-crypto` — no extra native dependency. The UI states
  that this is a demonstration and not production authentication. Production requires a server-side
  slow KDF (Argon2id / bcrypt / scrypt), a client secret, rate limiting, lockout, and — preferably —
  SMS OTP for account recovery.
- **Approval required:** No for the prototype; Yes before production.
- **Blocks implementation:** No.
- **Status:** Accepted.

### R-11 — Client notification channels

- **Description:** Should the client be notified by SMS, WhatsApp, email or push in production?
  The prototype only supports in-app notifications.
- **Impact:** Clients in the DRC often check SMS more often than they open an app. A production
  system that relies only on in-app notifications would miss payment deadlines.
- **Proposed decision:** The prototype is **in-app only**, and the notification centre says so
  explicitly (N-04). The `Notification` model already separates content (`titleKey`, `bodyKey`,
  `params`) from delivery, so a channel mapping can be added without a data-model change.
  Production channels are a business decision — recommended priority: SMS (universal) → WhatsApp →
  email → push.
- **Approval required:** Yes — to confirm the production channel set.
- **Blocks implementation:** No — the prototype is explicitly in-app.
- **Status:** Proposed.

### R-12 — Privacy of children's information

- **Description:** The app stores children's names, dates of birth, school levels, learning
  objectives and notes on the device, and (in production) would send them to a server.
- **Impact:** Children's data is sensitive. An insecure implementation, or a production system
  without a lawful basis, retention policy or parental consent flow, is a serious exposure.
- **Proposed decision:** For the prototype: collect the **minimum** (first name, last name
  optional, date of birth or age, level; school and notes optional) and store nothing beyond what
  the brief requires. For production: a consent flow for the parent/guardian, a defined retention
  period, encryption at rest, an audit trail, and the child's right to erasure — all requiring legal
  review in the DRC.
- **Approval required:** Yes — from the legal/data owner, before production.
- **Blocks implementation:** No for the prototype.
- **Status:** Open.

### R-13 — Semantic status colours are not part of the inherited MD3 palette

- **Description:** The V1 palette has `error` but no success / warning / info roles. The product
  displays many statuses, so semantic colours are needed.
- **Impact:** Without them, status badges would have to be built from `primary`/`secondary`/
  `tertiary`/`error` only, which reduces the signal and weakens the status hierarchy.
- **Proposed decision:** Add three new roles — `success #2E6B3F` / container `#CDEFD6`,
  `warning #8A5300` / container `#FFDDBC`, `info #2F5D9C` / container `#D6E3FF` — checked for
  WCAG AA contrast against their containers. Status is never conveyed by colour alone: every badge
  carries a text label.
- **Decision (S02, Q7):** **Approved as proposed.** The implementation additionally defines
  `on-success`, `on-warning` and `on-info` = `#FFFFFF` for text and icons placed on the solid role
  colour (all three pass WCAG AA). Status colours are implemented in
  `src/lib/theme/tokens.json` and documented in `context/ui-context.md` §3.3.
- **Approval required:** Yes — a visual approval.
- **Blocks implementation:** No longer — resolved in S02.
- **Status:** **Accepted.**

### R-14 — No final logo mark

- **Description:** The V1 `Logo.tsx` is an SVG placeholder explicitly marked "replace with the real
  logo". The icon, splash and adaptive-icon **assets** are final; the in-app logo lock-up is not.
- **Impact:** The Welcome screen shows a wordmark instead of a logo. Low severity, visible on the
  first screen.
- **Proposed decision:** Use the wordmark "Mon Précepteur" and the existing icon asset. Request the
  final logo from the brand owner; when supplied, it replaces `src/features/request/components/`
  logo component only.
- **Approval required:** No — proceed with the wordmark.
- **Blocks implementation:** No.
- **Status:** Open.

### R-15 — The admin workspace is French-only in the prototype

- **Description:** The brief requires the interface to support English and French. The administrator
  is an internal user in the DRC.
- **Impact:** An English-speaking administrator could not use the simulation.
- **Proposed decision:** Both languages are complete for every **client-facing** screen. The
  `admin.*` namespace is French-only for the prototype (confirmed by the user). The keys are
  namespaced so the admin namespace can be completed later without touching the client dictionaries.
- **Approval required:** Yes — already confirmed for this prototype.
- **Blocks implementation:** No.
- **Status:** Proposed.

### R-16 — Payment evidence attachment requires `expo-image-picker`

- **Description:** The brief says supporting evidence "may be attached". Attaching a photo needs a
  native module.
- **Impact:** An extra native dependency, an extra permission prompt, and additional storage
  handling.
- **Proposed decision:** Include the attachment using `expo-image-picker` (`~57.0.20`), storing only
  a local URI (P-06) — no upload. If the scope is not wanted, the field is simply hidden and the
  rest of the flow is unchanged.
- **Approval required:** Yes — to add the dependency.
- **Blocks implementation:** Only S19, and only for the attachment sub-feature.
- **Status:** Open.

### R-17 — The prototype has no authentication and no access control

- **Description:** The admin simulation is reachable by anyone, and there is no real session.
- **Impact:** In the prototype, nothing is at risk — the data is local, mock and non-sensitive.
  The risk is a **misunderstanding**: a demo audience might believe the admin area is protected.
- **Proposed decision:** Every admin screen carries a persistent "Simulation — no authentication"
  banner, and the PIN screen states that it is a demonstration. Production adds a real role model
  (guard in `context/architecture.md` §10).
- **Approval required:** No.
- **Blocks implementation:** No.
- **Status:** Accepted.

### R-18 — Migration from local storage to a backend

- **Description:** When the backend arrives, the local store must become a cache of server state,
  and the transition logic must move server-side.
- **Impact:** If the prototype's domain logic is written against the local store, the migration
  could become a rewrite.
- **Proposed decision:** The architecture already mitigates this: all business transitions live in
  pure `services/` functions that take state and return new state; the store is only a persistence
  mechanism; the `StoragePort` isolates storage. The migration plan is in
  `context/architecture.md` §10. The main residual work is moving the services behind an API
  client and adding conflict resolution for offline writes.
- **Approval required:** No.
- **Blocks implementation:** No.
- **Status:** Deferred.

### R-19 — The currency is a fixed single currency (USD)

- **Description:** The brief does not specify a currency. The DRC uses USD and CDF in practice.
- **Impact:** Affects the invoice, the payment declaration, the receipt and the formatting.
- **Proposed decision:** A single currency, `USD`, stored on every monetary record and formatted
  per locale (`USD 25.00` / `25,00 $US`). A `currency` field is stored anyway so a future
  multi-currency model does not require a schema change. No conversion, no FX rate.
- **Approval required:** Yes.
- **Blocks implementation:** Yes, from S16 (the proposal price).
- **Status:** Proposed.

### R-20 — The tutor-preference control applies to the adult journey

- **Description:** The brief introduces the tutor preference ("same tutor / different tutors / no
  preference") in the parent journey section. It is equally meaningful for an adult.
- **Impact:** A small UX inconsistency if handled inconsistently.
- **Proposed decision:** The control is shown in **both** journeys. This is the more coherent
  behaviour and costs nothing. Change it if the business prefers otherwise.
- **Approval required:** No — a default with a stated rationale.
- **Blocks implementation:** No.
- **Status:** Proposed.

### R-21 — Local schema upgrades discard data instead of migrating

- **Description:** When a persisted collection's schema version changes, the prototype discards the
  old data rather than migrating it.
- **Impact:** A prototype update loses the demo data. Acceptable while the data is mock data.
- **Proposed decision:** Discard on version mismatch (T-A23). The collection key includes the
  schema version precisely so the old data is never misread. A real migration path is only needed
  when real client data exists.
- **Approval required:** No.
- **Blocks implementation:** No.
- **Status:** Proposed.

### R-22 — The repository had no Git history and no prior documentation

- **Description:** `precepteur/` was completely empty (0 files, no Git repository) at the start of
  planning.
- **Impact:** There was no prior work in this repository to preserve, and no historical decisions to
  recover. Every document in `context/` and `design.md` is new.
- **Additional finding:** The sibling project `/home/anaclet/workspace/Dev/m3e-test` **is** an
  earlier prototype of this same product. Its brand palette, app configuration and assets were
  carried over deliberately; its component code was not, because V2 changes navigation, styling,
  validation and state management.
- **Proposed decision:** Documented. Git is initialised in step S01 so history begins there.
- **Approval required:** No.
- **Blocks implementation:** No.
- **Status:** Closed.

### R-23 — The target dependency manifest had to be adjusted for SDK 57

- **Description:** The manifest in `context/architecture.md` §1.2 could not be installed as written:
  `react-native@0.86.2` is incompatible with `jest-expo@57.0.6`, the Jest 30 range conflicts with
  the Jest 29 packages that `jest-expo` requires, and four packages are needed by the toolchain
  itself (`babel-preset-expo`, `@typescript-eslint/*`, `expo-constants`, `react-native-web` +
  `@expo/metro-runtime`).
- **Impact:** The documented baseline and the installed baseline no longer match character for
  character. Every deviation is listed with its reason in `context/architecture.md` §1.4 (D1–D8) and
  in the two npm `overrides` (`react-dom`, `expo-font`).
- **Proposed decision:** Keep the deviations. They are forced by the SDK, not chosen: `expo-doctor`
  reports 21/21 checks passing and `npx expo install --check` reports the dependencies up to date.
  The two `overrides` are peer-resolution fixes only and change no runtime API.
- **Approval required:** Yes — for the four added packages (`babel-preset-expo`,
  `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `expo-constants`,
  `react-native-web`, `@expo/metro-runtime`) and for the two `overrides`.
- **Blocks implementation:** No — S01 is complete with these versions. A later re-pin is possible.
- **Status:** Proposed.

### R-24 — SDK 57 changed the app-configuration schema

- **Description:** `expo-doctor` rejected two keys of the planned `app.json`: `newArchEnabled`
  (removed from the schema — the New Architecture is the only architecture in SDK 57) and the
  top-level `splash` key (now configured through the `expo-splash-screen` config plugin).
- **Impact:** The instructions in `context/step-features.md` S01 task 3 were invalid for SDK 57 and
  would have produced a failing configuration.
- **Proposed decision:** Documentation corrected — S01 task 3 now describes the SDK 57 form
  (`userInterfaceStyle: "light"` without `newArchEnabled`, splash through the
  `expo-splash-screen` plugin with the same `#F5DEC9` background and the same asset). The visual
  result is unchanged.
- **Approval required:** No — a factual correction of an invalid instruction.
- **Blocks implementation:** No.
- **Status:** Closed.

### R-25 — S02 scope decisions: shadow tokens, deferred components, toast host

- **Description:** S02 needs three decisions the specification did not settle: (a) how to express
  elevation with NativeWind, (b) `DateField` and `Attachment` need native dependencies that are not
  in the approved manifest, (c) `Toast` needs a host that stacks several toasts.
- **Impact:** Without a decision, S02 would either add unapproved dependencies or leave gaps that
  later steps would discover late.
- **Decision (S02, user-approved):**
  - **Shadows** are derived from the palette (`outline-variant` `#D6C2B5` at 45/60/80 % opacity),
    exposed as `elevation-1/2/3` (Tailwind `boxShadow` + `elevation` number). Documented in
    `context/ui-context.md` §3.2.1.
  - **`DateField` and `Attachment` are deferred.** `DateField` needs
    `@react-native-community/datetimepicker`; `Attachment` needs `expo-image-picker` (R-16, planned
    for S19 with the user's approval). Everything else in ui-context §5 is implemented in S02.
  - **`Toast` is a controlled presentational component** in S02; the `ToastHost` provider that queues
    and stacks the toasts is built with the app shell in **S04** (architecture §12 already places it
    in `src/components/feedback/`).
  - **`Sheet` needs a `GestureHandlerRootView` ancestor.** `@gorhom/bottom-sheet` depends on
    `react-native-gesture-handler`, which only works when the app is wrapped in
    `GestureHandlerRootView`. S04 must add it to `app/_layout.tsx`; until then a `Sheet` rendered in
    isolation will not respond to gestures.
- **Approval required:** Yes — obtained before implementation started.
- **Blocks implementation:** No.
- **Status:** **Accepted.**

---

## 3. Decisions Requested From the User

These are the items marked "Approval required: Yes" that are **not yet confirmed**. Each is
small enough to answer in one line.

| # | Question | Recommended answer | Blocks |
|---|---|---|---|
| Q1 | Is a client profile created at the contact step and identified by phone, with many requests allowed? | Yes (R-01) | S07 |
| Q2 | Are children reusable across requests while needs are per-request? | Yes (R-02) | S08 |
| Q3 | May a proposal cover several needs with one tutor? | Yes (R-03) | S16 |
| Q4 | Are partial payments and refunds excluded from the prototype? | Yes (R-04) | S19 |
| Q5 | On a duplicate transaction ID: reject **and** record the attempt for audit? | Yes (R-05) | S19 |
| Q6 | What is the real content of the "additional operational check" before assignment? | To be supplied by the team (R-06) | Production |
| Q7 | Are the three new semantic status colours approved? | Yes (R-13) — **confirmed in S02** | — |
| Q8 | Which notification channels will production use? | SMS first, then WhatsApp (R-11) | Production |
| Q9 | Is the payment evidence attachment in scope (adds `expo-image-picker`)? | Yes (R-16) | S19 |
| Q10 | Is USD the correct currency for the prototype? | Yes (R-19) | S16 |
| Q11 | Is the legal wording of the contract, and the consent flow for children's data, scheduled? | To be scheduled by the legal owner (R-08, R-12) | Production |
| Q12 | Are the six toolchain packages added in S01 and the two npm `overrides` accepted? | Yes (R-23) | — |

**None of these blocks the start of implementation.** S01 (project foundation) and S02 (tokens) are
complete; Q7 was confirmed during S02, and R-13 is now accepted. Q12 does not block anything: the
deviations are already installed and verified, and a later answer can trigger a re-pin.
