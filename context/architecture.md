# Architecture — Mon Précepteur V2

> Context file 2 of 6 (core context system).
> Companion documents: `context/project-overview.md`, `context/business-rules.md`,
> `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`,
> `context/progress-tracker.md`.
> UI/UX source of truth: `design.md`. Roadmap: `context/step-features.md`.

This document defines the **target architecture**. It is a specification, not a description of
existing code — no application code has been written yet (see `context/progress-tracker.md`).

---

## 1. Technical Baseline

### 1.1 Runtime & framework

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Runtime | Expo SDK | `~57.0.28` | All sibling Expo projects in this workspace use SDK 57 |
| UI runtime | React Native | `0.86.3` | Exact pin (Expo convention); `0.86.2` is not installable with `jest-expo@57.0.6` — see §1.4 |
| React | React | `19.2.3` | Exact pin |
| Language | TypeScript | `~6.0.3` | `strict: true`, `noUncheckedIndexedAccess` |
| Navigation | Expo Router | `~57.0.28` | File-based routing |
| Styling | NativeWind | `^4.2.7` + Tailwind `^3.4.19` | Tailwind **v3** only; NativeWind 4 does not support v4 |
| State | Zustand | `^5.0.15` | Vanilla store + `persist` middleware |
| Persistence | `@react-native-async-storage/async-storage` | `2.2.0` | Exact pin (SDK-bundled version) |
| Forms | React Hook Form | `^7.90.0` | + `@hookform/resolvers` `^6.0.0` |
| Validation | Zod | `^4.6.7` | v4 supported by `@hookform/resolvers` 6 |
| Animation | React Native Reanimated | `4.5.1` | + `react-native-worklets` `0.10.1` (required by Reanimated 4) |
| Bottom sheets | `@gorhom/bottom-sheet` | `^5.2.14` | Peer allows Reanimated `>=4.0.0-` |
| Icons | `lucide-react-native` | `^1.61.0` | Requires `react-native-svg` `15.15.4` |

### 1.2 Full dependency manifest (effective `package.json`)

The manifest below is the one actually installed in S01. It starts from the target manifest and
applies the deviations listed in §1.4.

```jsonc
{
  "overrides": {
    "react-dom": "19.2.3",
    "expo-font": "~57.0.4"
  },
  "dependencies": {
    "@expo/metro-runtime": "~57.0.17",
    "@gorhom/bottom-sheet": "^5.2.14",
    "@hookform/resolvers": "^6.0.0",
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo": "~57.0.28",
    "expo-constants": "~57.0.22",
    "expo-crypto": "~57.0.4",
    "expo-linking": "~57.0.13",
    "expo-router": "~57.0.28",
    "expo-splash-screen": "~57.0.10",
    "expo-status-bar": "~57.0.1",
    "expo-system-ui": "~57.0.4",
    "lucide-react-native": "^1.61.0",
    "react": "19.2.3",
    "react-hook-form": "^7.90.0",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-svg": "15.15.4",
    "react-native-web": "^0.21.2",
    "react-native-worklets": "0.10.1",
    "zod": "^4.6.7",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@testing-library/react-native": "^14.1.0",
    "@types/jest": "29.5.14",
    "@types/react": "~19.2.2",
    "@typescript-eslint/eslint-plugin": "^8.59.0",
    "@typescript-eslint/parser": "^8.59.0",
    "babel-preset-expo": "~57.0.16",
    "eslint": "^9.0.0",
    "eslint-config-expo": "~57.0.2",
    "jest": "~29.7.0",
    "jest-expo": "~57.0.6",
    "nativewind": "^4.2.7",
    "tailwindcss": "^3.4.19",
    "typescript": "~6.0.3"
  }
}
```

**Version rules** (matching workspace convention):

- `expo` and every `expo-*` package: **tilde** pin (`~57.x`), resolved via `npx expo install`.
- `react-native`, `react-native-reanimated`, `react-native-worklets`, `react-native-svg`,
  `@react-native-async-storage/async-storage`: **exact** pin.
- Third-party libraries: caret.
- Never use a caret on `expo` — Expo's `expo install` overwrites it and a caret causes a version
  mismatch between `package.json` and the native project.

**Verification note:** every native-module version above was cross-checked against
`packages/expo/bundledNativeModules.json` for SDK 57. NativeWind 4.2.7 declares only
`tailwindcss > 3.3.0` as a peer dependency, so it is compatible with SDK 57 / RN 0.86.3.
`@gorhom/bottom-sheet` 5.2.14 declares `react-native-reanimated: ">=3.16.0 || >=4.0.0-"`, which
covers Reanimated 4.5.1.

### 1.3 Deferred / conditional dependencies

| Package | When | Why |
|---|---|---|
| `expo-image-picker` `~57.0.20` | Step 18 (Mobile Money declaration), only if the evidence attachment is approved | Required for the optional "supporting evidence" attachment. Stored as a local URI only. |
| `expo-localization` `~57.0.2` | Step 3 (foundations) | Required to detect the device locale for EN/FR selection. Added in S03. |
| `expo-font` `~57.0.4` | Step 3 | Only if a custom font is introduced. **Decision: use the system/Roboto stack, do not add a custom font in the prototype.** Listed here as optional; omit if unused. |

No other dependency may be added without a written justification in `context/step-features.md`.

### 1.4 Deviations from the target manifest (S01)

The target manifest of §1.2 could not be installed as written. Every deviation below is forced by
SDK 57, by the Jest 29 toolchain that `jest-expo@57.0.6` requires, or by an npm peer-resolution
conflict. All of them are verified: `npx expo install --check` reports the dependencies up to date
and `npx expo-doctor` reports 21/21 checks passing.

| # | Change | From | To | Reason |
|---|---|---|---|---|
| D1 | `react-native` | `0.86.2` | `0.86.3` | `jest-expo@57.0.6` depends on `@react-native/jest-preset@^0.86.3`, so `0.86.2` cannot be installed at all. `0.86.3` is the React Native version bundled with SDK 57. |
| D2 | `jest` | `^30.5.2` | `~29.7.0` | `jest-expo@57.0.6` depends on the Jest **29** package family (`jest-message-util@^29`, `@jest/types@^29`). `npx expo install --check` expects `~29.7.0`. |
| D3 | `@types/jest` | `^30.0.0` | `29.5.14` | Must match the Jest 29 runtime (D2). |
| D4 | `babel-preset-expo` | absent | `~57.0.16` (dev) | `babel.config.js` needs the preset at the project root: Expo nests its own copy under `node_modules/expo/node_modules`, which Babel cannot resolve from the root, so `jest` failed with `Cannot find module 'babel-preset-expo'`. |
| D5 | `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` | absent | `^8.59.0` (dev) | `eslint-config-expo/flat` ships them transitively, but the flat config references the plugins by name, so they must be resolvable from the project root. |
| D6 | `expo-constants` | absent | `~57.0.22` | Required peer dependency of `expo-router`; `expo-doctor` flags it as "may crash outside of Expo Go". |
| D7 | `expo-splash-screen` | listed but not direct | direct dependency | The splash configuration moved from the legacy top-level `splash` key to this config plugin in SDK 57 (see R-24). |
| D8 | `react-native-web`, `@expo/metro-runtime` | absent | `^0.21.2`, `~57.0.17` | Required by the `web` npm script and by the `web.favicon` entry of `app.json`. Both are the SDK-matching versions resolved by `npx expo install`. |

**npm `overrides`** — both entries are peer-resolution fixes; neither changes a runtime API:

| Package | Override | Reason |
|---|---|---|
| `react-dom` | `19.2.3` | `react-native-web` declares `react-dom` as an optional peer; npm resolved `19.3.1`, which conflicts with the pinned `react@19.2.3`. |
| `expo-font` | `~57.0.4` | `expo-symbols@57.0.3` (a dependency of `expo-router`) requires `expo-font@^58`, which installed a second native module version. The override keeps the SDK 57 version, which exports the same `renderToImageAsync` API that `expo-symbols` uses. |

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ app/                          Expo Router routes (file-based)        │
│   _layout.tsx                 Root: providers, theme, i18n, splash    │
│   (client)/…                  Client journey screens                 │
│   (admin)/…                   Administrator simulation screens       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│ src/features/<domain>/                                              │
│   screens/       Route-level UI                                     │
│   components/    Domain-specific UI                                  │
│   hooks/         Domain hooks                                        │
│   services/      Pure business logic (transition guards, formatters) │
│   storage/       Repository adapters over the persistence port       │
│   types.ts       Domain types, statuses, validation schemas          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│ src/store/                Zustand stores (session, request, admin)   │
│ src/lib/                  Cross-cutting: persistence port, i18n,      │
│                           formatting, ids, crypto, result type        │
│ src/components/ui/        Shared design-system components             │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.1 Layering rules (enforced by review, not by tooling)

1. **Routes** (`app/`) may import from `src/features`, `src/components`, `src/store`, `src/lib`.
   Routes never contain business rules.
2. **Features** may import from `src/components`, `src/store`, `src/lib` and from *other* features
   only through that feature's public `index.ts` barrel.
3. **`src/store`** may import from `src/lib` and feature `types.ts` only. A store never imports
   from `src/components` and never from a screen file.
4. **`src/lib`** imports nothing from `src/features`, `src/store` or `src/components`. It is the
   bottom layer.
5. **A circular import between two features is a defect.** If two domains need each other, the
   shared concept moves down a layer.

---

## 3. Navigation Structure

### 3.1 Route tree

```
app/
├── _layout.tsx                       # Root Stack; providers, theme, i18n, fonts, splash
├── +not-found.tsx                    # Unknown route
├── (client)/
│   ├── _layout.tsx                   # Client Stack (shared header options)
│   ├── welcome.tsx                   # 1. Welcome
│   ├── login.tsx                     # Prototype login availability notice
│   ├── request-type.tsx              # 2. Request type (bottom sheet)
│   ├── children/
│   │   └── index.tsx                 # 3A. Child onboarding and learning context
│   ├── needs/
│   │   ├── child/[childId].tsx       # Legacy child-needs URL; redirects to Contact
│   │   └── self.tsx                  # 3C. Adult learning needs
│   ├── contact.tsx                   # 4. Two-step identity and address form
│   ├── pin.tsx                       # 5. PIN creation + confirmation
│   ├── review.tsx                    # 6. Review, submit, success toast and dashboard
│   ├── submitted.tsx                 # Legacy confirmation route; not used by submission
│   ├── dashboard.tsx                 # 7. Client dashboard
│   ├── proposal/[proposalId].tsx     # 7b. Proposal detail (accept / reject)
│   ├── contract/[contractId].tsx     # 7c. Contract detail + simulated signature
│   ├── invoice/[invoiceId].tsx       # 7d. Invoice detail
│   ├── payment/[invoiceId].tsx       # 7e. Mobile Money declaration
│   ├── receipt/[receiptId].tsx       # 7f. Receipt
│   ├── tutor/[needId].tsx            # 7g. Assigned tutor for a need
│   └── notifications.tsx             # 7h. Notifications
└── admin/                            # URL segment, NOT a group — see below
    ├── _layout.tsx                   # Admin Stack (visually distinct header)
    ├── index.tsx                     # A1. Admin dashboard (incoming requests)
    ├── request/[requestId].tsx       # A2. Request detail (client, children, needs)
    ├── proposal/new.tsx              # A3. Proposal builder
    ├── contract/new.tsx              # A4. Contract preparation
    ├── invoice/new.tsx               # A5. Invoice preparation
    ├── payment/[paymentId].tsx       # A6. Payment verification
    ├── receipt/issue.tsx             # A7. Receipt issuance
    ├── assignment.tsx                # A8. Tutor assignment
    └── history.tsx                   # A9. Activity history
```

**Why `admin/` is a segment and not a group (S04 — R-26).** Expo Router removes the group
segments from the URL, so an `(admin)` group would publish `/request/[requestId]`,
`/payment/[paymentId]` and `/receipt/issue` — three URLs that either collide with the client
routes (`/payment/[invoiceId]`, `/receipt/[receiptId]`) or lose their namespace, and an `(admin)`
index would also collide with the client index. The administrator's URLs are part of the
specification (§3.2), so the administrator tree is a **URL segment** (`app/admin/`) and the client
tree stays a **group** (`app/(client)/`), whose URLs are flat as specified.

**URLs are built, never concatenated.** `src/lib/navigation/routes.ts` exports the typed builders
(`routes.proposal(id)`, `routes.adminPayment(id)`) and the `ClientRoute` / `AdminRoute` unions. A
screen never assembles a path by hand.

**Entity ids are validated at runtime.** `src/lib/navigation/params.ts` holds the entity-id
prefixes and their patterns (`prp_…`, `inv_…`, …). A dynamic segment whose value does not match
its pattern renders the not-found state instead of the screen.


### 3.2 Route parameter types

Typed with Expo Router's `expo-env.d.ts` global route types. Dynamic segments are always
validated at runtime before use — a malformed ID shows the not-found state rather than crashing.
The validation uses the entity-id prefixes of §6.3 (`src/lib/navigation/params.ts`).

| Route | Params | Validated prefix |
|---|---|---|
| `/proposal/[proposalId]` | `proposalId: string` | `prp_` |
| `/contract/[contractId]` | `contractId: string` | `ctr_` |
| `/invoice/[invoiceId]` | `invoiceId: string` | `inv_` |
| `/payment/[invoiceId]` | `invoiceId: string` | `inv_` |
| `/receipt/[receiptId]` | `receiptId: string` | `rcp_` |
| `/tutor/[needId]` | `needId: string` | `ned_` |
| `/admin/request/[requestId]` | `requestId: string` | `req_` |
| `/admin/payment/[paymentId]` | `paymentId: string` | `pay_` |

The client declares the payment **for an invoice**, so `/payment/…` carries the *invoice* id
(`inv_…`); the administrator verifies a *payment*, so `/admin/payment/…` carries the *payment* id
(`pay_…`).

### 3.3 Navigation rules

- **One primary action per screen**; the primary action is the last element of the scroll view and
  is visually dominant.
- **Back behaviour**: system back and the header back button behave identically. The bottom sheet
  dismisses on swipe-down and on back.
- **Welcome actions:** "Get started" resumes a restored draft when one exists, otherwise it opens
  request-type selection; "Login" opens the explicitly unavailable prototype notice until local
  account sign-in is implemented.
- **Deep-linking to a nonexistent entity** renders a dedicated "not found" state with a route back
  to the dashboard — never a crash and never a blank screen.
- The admin simulation is reachable from the client dashboard through a clearly labelled
  "Administration (simulation)" entry. The Welcome screen has no admin entry.
- **No modal route blocks the stack**: bottom sheets and dialogs are used for secondary choices and
  short forms. Child registration is a full-screen route. Modal choices are implemented as
  components so the native back gesture is never trapped.
- Selector sheets use React Native `Modal` presentation so they render above an already-open form
  sheet; regular form sheets continue to use `@gorhom/bottom-sheet`.
- **Every screen has a translated header title.** The title comes from the `nav.*` keys of the
  dictionaries and is set by the stack layout, never from the route file name. The Welcome and
  Submitted screens have no header. The admin stack uses the `surface-highest` background and the
  "Administration (simulation)" title.

---

## 4. Feature Boundaries

Each domain owns its screens, components, hooks, services, storage adapter and types.

| Feature | Owns | Does **not** own |
|---|---|---|
| `request` | The request draft, the needs builder, the review screen, submission, request status derivation, the welcome screen | Contract/payment logic |
| `client` | Client profile, contact form, PIN, session unlock | Request content |
| `children` | Child records and registration form | The needs attached to a child |
| `proposal` | Proposal creation, client acceptance/rejection | Contract text, invoice amounts |
| `contract` | Contract preparation, issuing, client signature simulation | Proposal content |
| `invoice` | Invoice creation, numbering, status | Payment verification |
| `payment` | Mobile Money declaration, verification, duplicate detection | Receipt issuance details |
| `receipt` | Receipt generation from a confirmed payment | Payment status mutation (it only *reads* it) |
| `tutor` | Tutor catalogue, per-need assignment, client view of assigned tutor | Proposal pricing |
| `notification` | Notification generation from domain events, list screen, unread state | The events themselves |
| `admin` | The admin screens and the admin session (no privilege enforcement — see below) | Any domain rule |

**Admin privilege model (prototype):** the admin simulation has **no real access control**. Any user
can open it. This is deliberate and must be stated in the UI ("Simulation — no authentication"). A
real role model is a backend concern (see §10).

---

## 5. State-Management Approach

### 5.1 Store inventory

| Store | Responsibility | Persisted |
|---|---|---|
| `useSessionStore` | Current client session (clientId, phone, unlocked), locale override | Yes |
| `useClientStore` | Complete client profiles, including lookup by their normalized phone | Yes — profiles are currently kept in memory; persisted from S14 |
| `useRequestDraftStore` | The request currently being built (journey type, client ID and structured contact details, child drafts and child onboarding context, adult self needs, PIN step) | Yes — persisted with the full draft from S14; all draft fields are currently kept in memory |
| `useRequestStore` | Submitted requests + their derived status | Yes |
| `useDomainStore` | Proposals, contracts, invoices, payments, receipts, assignments, tutors | Yes |
| `useNotificationStore` | Notifications + unread count | Yes |
| `useAdminStore` | Admin simulation UI state (selected request, filters, toast) | No — session-only |

### 5.2 Why Zustand

- The workspace already uses Zustand (`tafuta/apps/mobile`) — consistent with local conventions.
- Zustand stores are plain TypeScript, trivially unit-testable without a renderer, which suits the
  automated test plan in `context/test-plan.md`.
- `persist` middleware with a custom storage adapter gives the "resume draft" and "restore after
  restart" behaviour required by BR-02 and the test plan.

### 5.3 Store rules

1. **Stores hold serialisable data only.** No class instances, no functions, no React elements.
   Functions live in `services/`.
2. **All business transitions go through a service function**, never from a component. A component
   calls e.g. `acceptProposal(proposalId)`; it never mutates the store directly.
3. **Every transition validates the current status** against the state machine in
   `context/business-rules.md` §2–§6 and returns a typed failure instead of throwing.
4. **Derived values are computed, not stored**, wherever practical (e.g. "next step for the client"
   is derived from statuses, not persisted).
5. **One store owns one aggregate area.** Cross-store writes are performed by a service that calls
   the owning store's action (no store-to-store direct mutation).

### 5.4 Result type (no exceptions across the UI boundary)

```ts
export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

Service functions return `Result`. Components render the error branch. This keeps error handling
uniform and testable, and avoids `try/catch` scattered through screens.

---

## 6. Local Persistence Strategy

### 6.1 The persistence port

All storage goes through a small port so the backend migration later does not touch feature code.

```ts
// src/lib/persistence/storage-port.ts
export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
}
```

Two implementations:

| Implementation | Phase | Purpose |
|---|---|---|
| `memoryStorageAdapter` | Step 1–12 | In-memory, so early steps work without touching native modules and are trivially testable |
| `asyncStorageAdapter` | Step 13 | The real adapter over `@react-native-async-storage/async-storage` |

Swapping the adapter in Step 13 must not require editing any feature, screen or store. This is
verified by a test that runs the same store suite against both adapters.

### 6.2 Key namespace

```
mon_precepteur/v2/<collection>/v1
```

| Key | Content |
|---|---|
| `mon_precepteur/v2/session/v1` | Active client session + locale override |
| `mon_precepteur/v2/draft/v1` | The request being built |
| `mon_precepteur/v2/requests/v1` | Submitted requests |
| `mon_precepteur/v2/clients/v1` | Client profiles |
| `mon_precepteur/v2/children/v1` | Child profiles |
| `mon_precepteur/v2/needs/v1` | Learning needs |
| `mon_precepteur/v2/proposals/v1` | Proposals |
| `mon_precepteur/v2/contracts/v1` | Contracts |
| `mon_precepteur/v2/invoices/v1` | Invoices |
| `mon_precepteur/v2/payments/v1` | Payment declarations |
| `mon_precepteur/v2/receipts/v1` | Receipts |
| `mon_precepteur/v2/tutors/v1` | Tutor catalogue |
| `mon_precepteur/v2/assignments/v1` | Tutor assignments |
| `mon_precepteur/v2/notifications/v1` | Notifications |
| `mon_precepteur/v2/events/v1` | Activity history |

The `/v2` segment is the product version; the trailing `v1` is the **schema version** of that
collection and is bumped when a persisted shape changes. A collection whose schema version differs
from the current one is discarded (not migrated) in the prototype — data loss on an upgrade is
acceptable and documented (risk `R-07`).

The namespace differs deliberately from the V1 prototype's `mon_precepteur/children/v1` so that V2
data can never be misread as V1 data.

### 6.3 Serialisation rules

- JSON only. No dates as `Date` objects — all timestamps are **epoch milliseconds (`number`)**.
- Every persisted record is validated with a Zod schema on read (`safeParse`). A record that fails
  validation is dropped, counted, and surfaced as a non-blocking "some data could not be restored"
  notice rather than crashing the app.
- IDs are strings generated by `expo-crypto`'s `randomUUID()` with a type prefix (`req_`, `prp_`, …).

### 6.4 The draft store and restoration

The request draft is persisted as the user progresses so that closing the app mid-request does not
lose work. On app start the app restores the draft. Pressing "Get started" resumes that draft when
one exists; otherwise it opens request-type selection. On submission the draft is cleared and the
request moves to `useRequestStore`.

---

## 7. Conceptual Data Model

### 7.1 Entity relationship overview

```
                        ┌───────────────┐
                        │    Client     │  (reusable profile, phone = primary key)
                        └───────┬───────┘
                                │ 1
                   ┌────────────┼────────────┐
                   │ n          │ n          │ n
            ┌──────▼─────┐ ┌────▼─────┐ ┌────▼────────┐
            │   Child    │ │ Request  │ │ Notification│
            └──────┬─────┘ └────┬─────┘ └─────────────┘
                   │  n         │ 1
                   │            │ n
            ┌──────▼────────────▼──────┐
            │      LearningNeed        │  (belongs to request; childId OR learner=client)
            └────────────┬─────────────┘
                         │ n
              ┌──────────▼───────────┐
              │   TutorAssignment    │◄────┐
              └──────────┬───────────┘     │ (tutor may cover many needs)
                         │ m             │
                         │               │
                    ┌────▼─────┐   ┌─────▼────┐
                    │  Tutor   │   │ Proposal │  (covers 1..n needs, recommends 1 tutor)
                    └──────────┘   └─────┬────┘
                                        │ 1
                        ┌───────────────┼───────────────┐
                        │ 1             │ 1             │ 1
                 ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
                 │  Contract   │ │   Invoice   │ │   Payment   │
                 └─────────────┘ └──────┬──────┘ └──────┬──────┘
                                          │ 1            │ 1
                                          │        ┌─────▼──────┐
                                          └───────►│   Receipt  │
                                                   └────────────┘

      ActivityEvent (evt_) references requestId + entityType + entityId + from/to status
```

### 7.2 Entity specifications

Field notation: **R** = required, **O** = optional.

#### Client (`cli_`)

Reusable client profile. Owned by the account, not by a single request.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `cli_<uuid>` |
| `firstName` | `string` | R | Trimmed, 1–60 |
| `lastName` | `string` | R | Trimmed, 1–60 |
| `phone` | `string` | R | Primary identifier. Stored in canonical `+243…` form; accepted local `0…` and `8…` forms are normalised before storage. Unique. |
| `email` | `string` | O | RFC-lite validation, unique if present |
| `address` | `string` | R for new contact submissions | Composed from the structured address parts in the contact form |
| `city` | `string` | R for new contact submissions | Selected from the curated DRC city list; defaults to Lubumbashi |
| `commune` | `string` | R for new contact submissions | |
| `quartier` | `string` | R for new contact submissions | |
| `avenue` | `string` | R for new contact submissions | |
| `number` | `string` | R for new contact submissions | Address number |
| `pinHash` | `string` | R | Salted SHA-256 hex. **Never the plain PIN.** |
| `pinSalt` | `string` | R | 16 random bytes hex |
| `createdAt` | `number` | R | Epoch ms |
| `updatedAt` | `number` | R | Epoch ms |

Relationships: 1 client → n children, 1 client → n requests, 1 client → n notifications.
Storage: persisted locally; intended for future server storage.

#### Child (`chd_`)

Profile-level, reusable across the client's requests.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `chd_<uuid>` |
| `clientId` | `string` | R | Owner |
| `firstName` | `string` | R | Trimmed, 1–60 |
| `lastName` | `string` | O | Trimmed, 1–60 (prompt allows "last name, if required") |
| `yearOfBirth` | `number` | R | Four-digit birth year; displayed age is derived from the current calendar year (no age restriction) |
| `level` | `string` | R | Educational level, free-form + suggestions (e.g. "6e", "Primaire 3") |
| `school` | `string` | O | Optional; the V1 prototype required it, V2 makes it optional to reduce friction |
| `notes` | `string` | O | ≤ 500 |
| `gender` | `'boy' \| 'girl'` | O | Collected by the W-03 onboarding wizard |
| `estimatedLevel` | `string` | O | First estimate from the wizard (`low`, `intermediate`, `satisfactory`, `high`); refined after the first session |
| `createdAt` / `updatedAt` | `number` | R | Epoch ms |

Relationships: n children → 1 client; n requests may reference the same child.
Storage: persisted locally; intended for future server storage.

The W-03 wizard keeps a `ChildOnboardingData` draft per child in the local request-draft store
(`onboardingByChildId`). The four-step wizard captures grade, estimated level, subjects, goals,
additional notes, preferred start date, cadence, days and time slots. It does not collect session
duration or address. On submission this context is copied to the child request's `learningContext`;
it is not converted into `LearningNeed` records. The request draft remains local-only and is cleared
after successful submission.

#### Request (`req_`)

The central workflow container.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `req_<uuid>`; also displayed to the client as a short reference (e.g. `MP-2026-0148`) |
| `reference` | `string` | R | Human-readable, unique. Generated locally from the date + a counter. |
| `clientId` | `string` | R | Owner |
| `type` | `'child' \| 'self'` | R | Journey type |
| `childIds` | `readonly [string] \| readonly []` | R | One child for `type: 'child'`; empty for `type: 'self'` |
| `needIds` | `string[]` | R | Empty for a submitted child request; ≥ 1 for a submitted adult request |
| `learningContext` | `ChildOnboardingData` | R for `type: 'child'` | Preserves child-onboarding answers on the submitted request; absent for adult requests |
| `tutorPreference` | `'same' \| 'different' \| 'none'` | R | Default `'none'` |
| `status` | `RequestStatus` | R | See `context/business-rules.md` §2 |
| `createdAt` / `updatedAt` | `number` | R | Epoch ms |
| `submittedAt` | `number` | O | Set on submission |

Relationships: 1 request → 1 client; 1 parent request → 1 child (via `childIds`); 1 request → 0..n needs;
1 request → n proposals (successive proposals after rejections); 1 request → 1..n events.

Storage: persisted locally; intended for future server storage.

#### LearningNeed (`ned_`)

The structured learning requirement used by the adult client journey and by later need-based
administrative workflows. The current child client journey does not create these records.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `ned_<uuid>` |
| `requestId` | `string` | R | Owning request |
| `childId` | `string` | O | Set when the learner is a child |
| `learnerIsClient` | `boolean` | R | `true` for the adult journey |
| `subject` | `string` | R | Subject or skill, 2–80 |
| `level` | `string` | R | Current level, e.g. "3e", "débutant" |
| `objective` | `string` | R | Learning objective, 5–400 |
| `frequency` | `string` | R | e.g. "2×/semaine" — stored as a structured value, see below |
| `sessionMinutes` | `number` | R | Allowed: 30, 45, 60, 90, 120 |
| `availability` | `string` | R | Free text ≤ 300 |
| `format` | `'home' \| 'online' \| 'center'` | R | Preferred format |
| `location` | `string` | O | Required in practice when `format` is `'home'` or `'center'`; ≤ 120 |
| `notes` | `string` | O | ≤ 500 |
| `createdAt` / `updatedAt` | `number` | R | Epoch ms |

`frequency` stores the selected cadence option as a stable string value. The design options include
weekly, monthly and Flexible cadences, so they are not all representable as a truthful `perWeek`
number (R-33). Labels are localized at presentation time.

Invariants: exactly one of `childId` set / `learnerIsClient === true`. Enforced by Zod refinement.
Adult submissions create one or more needs with `learnerIsClient: true`; child submissions create
none and instead carry their onboarding answers as request-level `learningContext`.

Relationships: n needs → 1 request; 1 need → 0..n assignments; n needs → 0..n proposals.

#### Tutor (`tut_`)

Internal catalogue. Not publicly browsable.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `tut_<uuid>` |
| `firstName` / `lastName` | `string` | R | |
| `phone` | `string` | R | Internal; shown to the client only after assignment |
| `email` | `string` | O | |
| `subjects` | `string[]` | R | Subjects the tutor can teach |
| `formats` | `('home'\|'online'\|'center')[]` | R | Formats supported |
| `city` / `area` | `string` | O | |
| `bio` | `string` | O | ≤ 500 |
| `isActive` | `boolean` | R | `false` → not selectable |
| `createdAt` | `number` | R | |

#### Proposal (`prp_`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `prp_<uuid>` |
| `requestId` | `string` | R | |
| `needIds` | `string[]` | R | ≥ 1 — the needs this proposal covers |
| `tutorId` | `string` | R | Recommended tutor |
| `price` | `number` | R | Amount in the prototype currency |
| `currency` | `'USD'` | R | Single currency in the prototype |
| `billingCycle` | `'monthly' \| 'per_session' \| 'one_off'` | R | |
| `frequency` | `string` | R | Mirrors the covered needs' cadence |
| `sessionMinutes` | `number` | R | |
| `durationLabel` | `string` | R | e.g. "3 mois" |
| `conditions` | `string` | R | ≤ 1000 |
| `status` | `ProposalStatus` | R | See `context/business-rules.md` §3 |
| `clientDecision` | `'accepted' \| 'rejected'` | O | |
| `clientDecisionAt` | `number` | O | |
| `clientComment` | `string` | O | ≤ 500, client's rejection reason |
| `createdAt` / `updatedAt` | `number` | R | |

Relationships: n proposals → 1 request; n proposals → n needs (covered); 1 proposal → 1 tutor.

#### Contract (`ctr_`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `ctr_<uuid>` |
| `requestId` | `string` | R | |
| `proposalId` | `string` | R | |
| `contractNumber` | `string` | R | Unique, e.g. `CTR-2026-0031` |
| `status` | `ContractStatus` | R | See `context/business-rules.md` §4 |
| `terms` | `string` | R | Placeholder wording — **not legally validated** |
| `clientSignedAt` | `number` | O | |
| `clientSignatureName` | `string` | O | Typed name; a *simulation* of a signature |
| `signatureSimulated` | `boolean` | R | Always `true` in the prototype |
| `issuedAt` | `number` | O | |
| `createdAt` / `updatedAt` | `number` | R | |

Relationships: 1 contract → 1 proposal → 1 request.

#### Invoice (`inv_`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `inv_<uuid>` |
| `number` | `string` | R | Unique, e.g. `FAC-2026-0102` |
| `requestId` | `string` | R | |
| `proposalId` | `string` | R | |
| `contractId` | `string` | O | Set once the contract is issued |
| `needIds` | `string[]` | R | The billable needs |
| `amount` | `number` | R | Amount due |
| `currency` | `'USD'` | R | |
| `issuedAt` | `number` | R | Issue date |
| `dueDate` | `number` | O | |
| `status` | `InvoiceStatus` | R | See `context/business-rules.md` §5 |
| `createdAt` / `updatedAt` | `number` | R | |

#### Payment (`pay_`)

A **client declaration**, not a verified payment. The distinction is the point of the model.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `pay_<uuid>` |
| `invoiceId` | `string` | R | |
| `requestId` | `string` | R | Denormalised for lookup |
| `transactionId` | `string` | R | Client-declared, 4–40 chars, `[A-Za-z0-9-]` |
| `payerPhone` | `string` | R | May differ from the client's phone (BR-13) |
| `amountDeclared` | `number` | R | > 0 |
| `operator` | `'mpesa' \| 'orange' \| 'afrimoney' \| 'airtel' \| 'other'` | R | |
| `paidAt` | `number` | R | Date of the Mobile Money transaction; not in the future |
| `evidenceUri` | `string` | O | Local URI of an attached proof |
| `status` | `'pending_verification' \| 'confirmed' \| 'rejected' \| 'duplicate'` | R | |
| `reviewedBy` | `string` | O | Admin identifier (`'admin_local'`) |
| `reviewedAt` | `number` | O | |
| `rejectionReason` | `string` | O | Required when `status === 'rejected'` |
| `duplicateOfPaymentId` | `string` | O | Set when `status === 'duplicate'` |
| `createdAt` | `number` | R | |

Relationships: 1 payment → 1 invoice; 0..1 receipt → 1 payment.

#### Receipt (`rcp_`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `rcp_<uuid>` |
| `number` | `string` | R | Unique, e.g. `REC-2026-0077` |
| `paymentId` | `string` | R | Only a confirmed payment has a receipt |
| `invoiceId` | `string` | R | |
| `requestId` | `string` | R | |
| `amount` | `number` | R | Copied from the confirmed payment |
| `currency` | `'USD'` | R | |
| `issuedAt` | `number` | R | |
| `issuedBy` | `string` | R | `'admin_local'` |

#### TutorAssignment (`asg_`)

Per-need assignment — the mechanism that satisfies BR-07.

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | `asg_<uuid>` |
| `needId` | `string` | R | |
| `requestId` | `string` | R | |
| `tutorId` | `string` | R | |
| `status` | `'proposed' \| 'assigned' \| 'active' \| 'completed' \| 'cancelled'` | R | |
| `assignedAt` | `number` | O | |
| `startsAt` | `number` | O | First session date |
| `notes` | `string` | O | Internal |

#### Notification (`ntf_`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | |
| `clientId` | `string` | R | Recipient |
| `requestId` | `string` | O | |
| `type` | `NotificationType` | R | See §7.3 |
| `titleKey` | `string` | R | **i18n key**, not a literal string |
| `bodyKey` | `string` | R | i18n key |
| `params` | `Record<string, string \| number>` | O | Interpolation values |
| `createdAt` | `number` | R | |
| `readAt` | `number` | O | `undefined` = unread |

Notifications store **i18n keys**, never rendered strings, so a language switch re-renders past
notifications in the new language.

#### ActivityEvent (`evt_`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| `id` | `string` | R | |
| `requestId` | `string` | R | |
| `entityType` | `'request' \| 'proposal' \| 'contract' \| 'invoice' \| 'payment' \| 'receipt' \| 'assignment'` | R | |
| `entityId` | `string` | R | |
| `actor` | `'client' \| 'admin' \| 'system'` | R | |
| `fromStatus` | `string` | O | |
| `toStatus` | `string` | O | |
| `note` | `string` | O | |
| `createdAt` | `number` | R | |

### 7.3 Notification types

| Type | Triggered when | Audience |
|---|---|---|
| `request_received` | Request submitted | Client |
| `proposal_sent` | Proposal sent to the client | Client |
| `proposal_accepted` | Client accepted | Admin |
| `proposal_rejected` | Client rejected | Admin |
| `contract_issued` | Contract issued | Client |
| `contract_signed` | Client signed (simulated) | Admin |
| `invoice_issued` | Invoice issued | Client |
| `payment_declared` | Client declared a transaction | Admin |
| `payment_confirmed` | Admin confirmed | Client |
| `payment_rejected` | Admin rejected | Client |
| `receipt_issued` | Receipt generated | Client |
| `tutor_assigned` | Tutor assigned to a need | Client |
| `service_started` | Assignment became active | Client |

### 7.4 Ownership analysis — request-scoped vs profile-scoped

The maintainer confirmed **R-01 on 2026-10-23**: a client profile is created at the contact step,
identified by the phone number, and may own multiple requests. Child details entered before that
profile exists are temporary `ChildDraft` values in `useRequestDraftStore`; they are not standalone
profile records until the later profile/submission integration step.

| Entity | Scope | Reasoning |
|---|---|---|
| Client | **Profile** | The identity must survive across requests; the phone number is the account key (BR-01, BR-02). |
| Child | **Profile** | The parent registers children once and reuses them in later requests (BR-04). The request holds only `childIds`. |
| Request | **Container** | Owns the workflow, its needs, and the whole transactional chain. |
| LearningNeed | **Request** | A need is an analysed requirement *of a request*; the proposal/contract/invoice/assignment chain must resolve to a request (BR-05). Consequence: re-submitting a similar need re-enters it rather than reusing it. Accepted for the MVP (see risk `R-02`). |
| Tutor | **Catalogue** | Reusable across requests and needs. |
| Proposal | **Request** | An offer for a specific request's needs. |
| Contract | **Request** | Contracted per request. |
| Invoice | **Request** | Billing per request. |
| Payment | **Request** (via invoice) | Payment settles an invoice which belongs to a request. |
| Receipt | **Request** (via payment) | ditto. |
| TutorAssignment | **Request + Need** | Bridges the request's needs to the tutor catalogue. |
| Notification | **Client** | The client is the recipient; the request reference is optional context. |
| ActivityEvent | **Request** | The request is the audit scope. |

---

## 8. Data Flow

### 8.1 Request submission

```
User input
  → React Hook Form (controlled)
  → Zod schema (per screen) → field-level errors
  → service function (e.g. addNeed) → business rule check → Result
  → store action → state update
  → persistence adapter → AsyncStorage
  → re-render
```

### 8.2 Administrative transition (proposal → client decision)

```
Admin screen
  → service: sendProposal(requestId, input)
      → validate current request status (must be under_review)
      → create Proposal (status: 'sent')
      → request.status → 'proposal_sent'
      → write ActivityEvent (actor: admin)
      → create Notification (client, proposal_sent)
  → persist all
```

```
Client screen
  → service: decideProposal(proposalId, 'accepted' | 'rejected')
      → validate proposal.status === 'sent'
      → proposal.status → 'accepted' | 'rejected'
      → request.status → 'proposal_accepted' | 'proposal_rejected'
      → write ActivityEvent (actor: client)
      → create Notification (admin-facing or client-facing)
  → persist all
```

### 8.3 Payment declaration and verification

```
Client → declarePayment(invoiceId, input)
  → duplicate check across all payments (transactionId)
      → duplicate found → status 'duplicate' + flag (NOT confirmed)
  → payment.status = 'pending_verification'
  → invoice.status = 'awaiting_payment' (if it was 'issued')
  → request.status → 'payment_pending'
  → Notification → admin (payment_declared)

Admin → verifyPayment(paymentId, 'confirmed' | 'rejected', reason?)
  → validate payment.status === 'pending_verification'
  → confirmed:
      payment.status = 'confirmed'
      invoice.status = 'paid'
      create Receipt
      request.status → 'payment_verified'
      Notification → client (payment_confirmed, receipt_issued)
  → rejected:
      payment.status = 'rejected' (reason required)
      invoice.status → 'awaiting_payment' (unchanged, still due)
      request.status → 'payment_pending'
      Notification → client (payment_rejected) → client may declare again
```

### 8.4 Derived "next step" for the client dashboard

The dashboard never stores a "current step" string. It derives it:

```ts
function deriveNextStep(context: RequestContext): NextStep {
  // 1. no proposal sent yet → "We are reviewing your request"
  // 2. proposal sent, awaiting decision → "Review the proposal"
  // 3. accepted, no contract → "Contract being prepared"
  // 4. contract issued, unsigned → "Sign the contract"
  // 5. signed, no invoice → "Invoice being prepared"
  // 6. invoice issued, unpaid → "Pay the invoice"
  // 7. payment pending → "Payment awaiting verification"
  // 8. paid, no receipt → "Receipt being issued"
  // 9. receipt issued, needs unassigned → "Tutor being assigned"
  // 10. all needs assigned → "Service starting"
  // 11. all assignments active → "Service in progress"
}
```

This function is pure, unit-testable, and the single source of truth for what the dashboard shows.

---

## 9. Error Handling

### 9.1 Layers

| Layer | Mechanism |
|---|---|
| Form input | Zod per-screen schema → `fieldErrors` map, rendered under each field |
| Service / business rule | `Result<T, AppError>` — no exceptions across the UI boundary |
| Store | Zustand action returns `Result`; never throws |
| Component | Branches on `result.ok`; shows an inline error or a toast |
| Screen-level | `ErrorBoundary` per route group; unknown entity → a "not found" state, not a crash |
| Async | Every async call is awaited inside a `try/catch` that converts a thrown error into a `Result` |

### 9.2 `AppError` shape

```ts
export type AppErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'INVALID_TRANSITION'
  | 'DUPLICATE_TRANSACTION'
  | 'DUPLICATE_PHONE'
  | 'STORAGE_FAILURE'
  | 'CORRUPT_DATA'
  | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode;
  message: string;      // i18n key, not a literal
  params?: Record<string, string | number>;
}
```

`message` is an i18n key so errors are localizable.

### 9.3 Recovery behaviours

- **Corrupt persisted data**: the failing record is dropped, the app continues, and a dismissible
  notice explains that some data could not be restored.
- **Storage write failure**: the in-memory state is still updated (the session continues) and a
  non-blocking warning is shown. The prototype never silently pretends data was saved when it was
  not — the notice explicitly says the change may be lost.
- **Unknown entity ID in a route**: a "not found" state with a route back to the dashboard.
- **Network**: none. There is no network layer in the prototype; this is a deliberate boundary, not
  an omission (see §10).

---

## 10. Future Backend Migration Considerations

The prototype is architected so that a server can be introduced without rewriting the product.

| Today (prototype) | Tomorrow (backend) | Migration path |
|---|---|---|
| `StoragePort` over AsyncStorage | `StoragePort` over HTTP + local cache | Replace the adapter implementation; feature code is untouched |
| IDs generated on the client | IDs generated by the server | Keep client-generated IDs as client-side idempotency keys |
| Transitions executed locally | Transitions executed by the server | Move each `service` transition behind an API call; keep the `Result` contract |
| PIN hash local | No local PIN; session token from the server | The `useSessionStore` shape stays; only the token handling changes |
| Local `ActivityEvent` log | Server-side audit log | Same shape; the server becomes the source of truth |
| Local duplicate detection | Server-side duplicate detection | Keep the local check as an optimistic UI aid; the server check wins |
| Admin simulation with no access control | Role-based access control | `useSessionStore` gains a role; admin routes get a guard |
| In-app notifications | Push/SMS/WhatsApp | `NotificationType` → channel mapping; the store already separates content from delivery |
| Local numbering (`FAC-…`) | Server numbering | Number generation moves to the server; the client keeps the string |

**Principle:** the client is a *presentation layer over a domain*, not the domain's only copy. The
domain rules live in `src/features/*/services/`, which is where the server-equivalent logic would
eventually live.

---

## 11. Dependency Boundaries

### 11.1 Rules

1. `src/lib/**` may not import from `src/features/**`, `src/store/**` or `src/components/**`.
2. `src/store/**` may not import from `src/components/**` or from any screen file.
3. `src/features/a` may import `src/features/b` only through `src/features/b/index.ts`.
4. Route files (`app/**`) may not contain domain logic — only composition.
5. `src/features/*/services/**` are pure functions: no React, no navigation, no side effects other
   than calling an injected repository. This makes them unit-testable without a renderer.
6. No feature may import a third-party UI library directly except through `src/components/ui/**`.
   (Exception: `@gorhom/bottom-sheet` is wrapped by `src/components/ui/Sheet.tsx`.)
7. Icons come exclusively from `lucide-react-native` via `src/components/ui/Icon.tsx` — this centralises
   the `react-native-svg` dependency and keeps the icon set consistent.

### 11.2 Bottom-sheet usage

The request-type selection and short form interactions use bottom sheets. Child registration is a
full-screen route so its fields can scroll naturally when the keyboard is open. The library is
wrapped once in `src/components/ui/Sheet.tsx` so the rest of the app does not depend on its API.

---

## 12. Project Structure (target)

```
precepteur/
├── AGENTS.md
├── CLAUDE.md                      # "@AGENTS.md"
├── design.md                      # UI/UX source of truth
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── business-rules.md
│   ├── ui-context.md
│   ├── code-standards.md
│   ├── ai-workflow-rules.md
│   ├── step-features.md
│   ├── test-plan.md
│   ├── risk-register.md
│   └── progress-tracker.md
├── app/                           # Expo Router routes
├── src/
│   ├── components/
│   │   ├── ui/                    # Button, Input, Select, Card, Sheet, Badge, Timeline, Toast, Icon, … (see ui-context §5)
│   │   └── feedback/              # ErrorBoundary, ToastHost, NotFound, RoutePlaceholder (S04)
│   ├── features/
│   │   ├── request/               # draft store, needs builder, review, submission, welcome screen
│   │   ├── client/                # profile, contact, PIN
│   │   ├── children/
│   │   ├── proposal/
│   │   ├── contract/
│   │   ├── invoice/
│   │   ├── payment/
│   │   ├── receipt/
│   │   ├── tutor/
│   │   ├── notification/
│   │   └── admin/
│   ├── hooks/
│   ├── lib/
│   │   ├── persistence/           # storage-port, memory adapter, async-storage adapter
│   │   ├── i18n/                  # locales/en.ts, locales/fr.ts, index.ts
│   │   ├── crypto/                # pin hashing
│   │   ├── format/                # currency, date, relative time
│   │   ├── navigation/             # routes.ts (typed builders), params.ts (entity-id validation) — S04
│   │   ├── theme/                 # tokens.json (single source of truth) + typed helpers
│   │   └── result.ts
│   ├── store/
│   └── types/
├── assets/                        # icon, splash, adaptive icons (reused from the V1 prototype) + mon-precepteur-logo.png (brand lock-up, S05)
├── jest/                          # Jest-only module mocks (bottom-sheet-mock.js)
├── app.json
├── babel.config.js                # jsxImportSource: 'nativewind'
├── metro.config.js                # withNativeWind
├── tailwind.config.js             # design tokens
├── global.css
├── nativewind-env.d.ts
├── eslint.config.js
├── jest.config.js
├── jest.setup.js
├── expo-env.d.ts                  # ambient declaration for image imports (S05)
├── tsconfig.json
└── package.json
```

`src/lib/theme/tokens.json` was added in **S02** as the single source of truth for the palette,
spacing, radii, typography, elevation and motion. `tailwind.config.js` requires it directly, and
`src/lib/theme/index.ts` re-exports typed helpers (`palette`, `spacing`, `radii`, `elevation`,
`motion`, `themeColor`). It belongs in `src/lib` because it is cross-cutting and imports nothing
from `src/features`, `src/store` or `src/components`. The `jest/` folder holds Jest-only module
mocks (currently the bottom-sheet mock, which renders its children only when the sheet is open).
`expo-env.d.ts` was added in **S05**: it declares the `*.png` module so a bundled asset can be
imported with a type instead of `require`, and it is ignored by ESLint.

### 12.1 Configuration files (reference content)

`app.json` adds the `expo-localization` plugin with `supportedLocales` for `ios` and `android` (`en`, `fr`). `src/lib/i18n/` provides typed dictionaries, `translate` with interpolation and plurals, a French default with an explicit locale override stored in `useSessionStore`, and `src/hooks/use-translation.ts`. The device locale does not select the initial language. `src/lib/format/` provides locale-aware formatters using `Intl`. `src/store/session-store.ts` holds the session state (locale override).

`babel.config.js`
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
  };
};
```

`metro.config.js`
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

`tsconfig.json`
```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

`tailwind.config.js` — the token set is defined in `context/ui-context.md` §3 and must match it
exactly.

### 12.2 Assets carried over from the V1 prototype

The V1 prototype at `/home/anaclet/workspace/Dev/m3e-test/assets/` already contains a coherent
`icon.png`, `splash-icon.png`, `android-icon-{foreground,background,monochrome}.png` and
`favicon.png` for the "Mon Précepteur" brand (splash `#F5DEC9`, adaptive background `#FFF8F4`).
These are **copied into V2** at the foundation step so the app has a coherent identity from day one.
They are the only V1 assets reused; no V1 component code is carried over verbatim. The Expo
`expo-splash-screen` plugin uses `assets/mon-precepteur-logo.png` as its image so the native splash
shows the same brand lock-up as the Welcome screen.

---

## 13. Testing Architecture

Configured in the foundation step, exercised from the first feature step:

| Level | Tool | Scope |
|---|---|---|
| Unit | `jest-expo` | Domain services, state machines, validation schemas, formatters, the pure `deriveNextStep` |
| Component | `@testing-library/react-native` | Shared UI components, form screens, state rendering |
| Integration | `jest-expo` | Store + persistence round-trips, full workflow transitions |
| Manual | — | Usability, screen size, visual review, real-device behaviour |

Full scenario list: `context/test-plan.md`.

---

## 14. Architecture Decisions (ADR summary)

| # | Decision | Rationale | Alternatives rejected |
|---|---|---|---|
| AD-01 | Expo SDK 57, not 58 | All sibling Expo apps run 57; SDK 58 was 2 days old at planning time | Expo 58 (ecosystem lag risk) |
| AD-02 | Expo Router over React Navigation | Required by the brief; file-based routing suits the linear journey; matches `tafuta` and `masomo` | React Navigation (the V1 choice) |
| AD-03 | NativeWind over `react-native-paper` | Required by the brief; V1 used Paper, V2 moves to Tailwind tokens | Paper (V1 parity, but not the requested stack) |
| AD-04 | Zustand over React Context | The brief requires Zustand; testable without a renderer | React Context (V1 parity) |
| AD-05 | Zod over hand-rolled validation | The brief requires Zod; reusable schemas double as persistence validators | Hand-rolled (the V1 choice) |
| AD-06 | Needs are request-scoped, children are profile-scoped | Keeps the proposal → contract → invoice → assignment chain resolvable to a request while letting parents reuse children | Needs as child-scoped (breaks request-level pricing/assignment) |
| AD-07 | Assignment is per need, not per request | Directly satisfies "multiple tutors per child" and "one tutor for several needs" | Assignment per request (violates BR-07) |
| AD-08 | Payments and statuses are separate entities | BR-14 forbids one overloaded status field | A single `status` on the request |
| AD-09 | A `StoragePort` with two adapters | Keeps Step 13 a small, testable change instead of a rewrite | Writing AsyncStorage calls inline |
| AD-10 | Notifications store i18n keys | Past notifications re-render correctly after a language switch | Storing rendered strings |
| AD-11 | Custom lightweight i18n over `expo-localization` | The brief asks for the localisation *structure*, not a translation platform; a typed dictionary gives compile-time FR/EN parity | `i18n-js` / `react-i18next` (extra dependency for the same outcome) |
| AD-12 | SHA-256 salted PIN hash via `expo-crypto` | Satisfies "never store a PIN in plain text" with zero extra native dependencies; explicitly not production auth | `expo-secure-store` (still not real auth); a native Argon2 module (new dependency) |
| AD-13 | The administrator's route tree is a URL segment (`app/admin/`), not a group | Expo Router strips the group segments from the URL, so an `(admin)` group would publish `/payment/…` and `/receipt/…` and would shadow the client routes; the segment produces the `/admin/...` URLs of §3.2 exactly (R-26) | `(admin)` group (collides with `/payment/[invoiceId]`, `/receipt/[receiptId]` and the client index) |
