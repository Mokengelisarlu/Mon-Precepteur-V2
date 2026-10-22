# Implementation Roadmap — Mon Précepteur V2

> Context file (extension of the six-file core system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/code-standards.md`,
> `context/ai-workflow-rules.md`, `context/progress-tracker.md`.
> UI/UX source of truth: `design.md`.

**Legend:** `[ ]` planned · `[~]` in progress · `[x]` done · `[-]` cancelled

Each step is small enough to implement, review and test **independently**. A step is only started
when it is the **approved current step** (see `context/progress-tracker.md`).

---

## 0. Deviations From the Suggested Sequence

The brief suggested a 24-step sequence. Two deviations were made, both because of dependency
ordering:

| Deviation | Reason |
|---|---|
| **Design tokens (S02) moved before navigation (S04)** | The navigation shell renders a header, a surface background and a primary button. Those need the token set to exist. The suggested order put navigation second and tokens third. |
| **Localization infrastructure split out as S03** | `context/code-standards.md` forbids hardcoded user-facing strings. If the i18n layer is not in place before the first screen (S05), the first four screens will be built with hardcoded strings and then all need rewriting. One extra step removes that class of work. |

Total: **25 steps**.

A third, smaller adjustment: the **tutor catalogue seeding** is folded into S15 (Administrator
simulation) rather than being a separate step, because the catalogue is meaningless without the
admin screens that consume it.

---

## Phase 1 — Foundation

### [x] S01 — Project foundation and configuration audit

- **Objective:** Turn the empty repository into a running, type-checked Expo application with the
  exact dependency set pinned in `context/architecture.md` §1.2, and establish the verification
  commands.
- **Scope:** Project scaffolding only. No product feature.
- **Prerequisites:** None. This is the first step.
- **Tasks:**
  1. Initialise Git (`git init`), add `.gitignore` (node_modules, .expo, dist, *.log, .env*).
  2. Create `package.json` with the exact dependency versions from `context/architecture.md` §1.2.
     Install with `npm install`. Use `npx expo install` for every `expo-*` package so the versions
     match SDK 57.
  3. Add `app.json` — copy the V1 identity: name `Mon Précepteur`, slug `mon-precepteur`, portrait,
     light UI style, icon, splash (`#F5DEC9`), adaptive icon (`#FFF8F4`), Android
     `softwareKeyboardLayoutMode: "resize"`. Add `scheme`, `ios.bundleIdentifier`,
     `android.package`, `userInterfaceStyle: "light"`. **SDK 57 correction:** `newArchEnabled` no
     longer exists in the configuration schema (the New Architecture is the only one) and the
     splash is configured through the `expo-splash-screen` config plugin, not the top-level
     `splash` key (see R-24).
  4. Copy the V1 assets from `/home/anaclet/workspace/Dev/m3e-test/assets/` into `assets/`
     (icon, splash, adaptive foreground/background/monochrome, favicon).
  5. Configure `babel.config.js` (NativeWind `jsxImportSource`), `metro.config.js`
     (`withNativeWind`), `global.css`, `nativewind-env.d.ts`, `tailwind.config.js` (tokens from
     `context/ui-context.md` §3).
  6. Configure `tsconfig.json` per `context/code-standards.md` §1.1, with the `@/*` alias.
  7. Configure `eslint.config.js` (flat, `eslint-config-expo/flat` + `@typescript-eslint`, with
     `no-explicit-any: error`).
  8. Configure `jest.config.js` (`jest-expo` preset) and add the four npm scripts
     (`start`, `android`, `typecheck`, `lint`, `test`).
  9. Create a minimal `app/_layout.tsx` and `app/index.tsx` placeholder that renders the app
     surface colour, to prove the toolchain works.
  10. Create the directory skeleton described in `context/architecture.md` §12.
  11. Toolchain packages the toolchain itself needs, beyond the §1.2 baseline:
      `babel-preset-expo` (Babel cannot resolve Expo's nested copy), `@typescript-eslint/eslint-plugin`
      and `@typescript-eslint/parser` (the flat config references them by name), `expo-constants`
      (required peer of `expo-router`), `react-native-web` and `@expo/metro-runtime` (the `web`
      script). See `context/architecture.md` §1.4 (D1–D8) and R-23.
- **Expected files:** `package.json`, `package-lock.json`, `.gitignore`, `app.json`, `babel.config.js`,
  `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, `tsconfig.json`,
  `eslint.config.js`, `jest.config.js`, `assets/*`, `app/_layout.tsx`, `app/index.tsx`, and the
  empty `src/` folders.
- **Data & state:** None.
- **Acceptance criteria:**
  - [x] `npm run typecheck` passes with no errors.
  - [x] `npm run lint` passes with no errors.
  - [x] `npm test` runs (a trivial test passes).
  - [x] `npx expo start` launches and the placeholder screen renders on the correct brand surface
        colour (`#FFF8F4`).
  - [x] `npx expo-doctor` reports no blocking compatibility errors.
  - [ ] `git status` is clean except for the intended files.
- **Tests:** One smoke test asserting the root layout renders.
- **Definition of done:** The app boots, the toolchain is green, the dependency versions match
  `context/architecture.md` §1.2/§1.4 as installed, and the first commit exists (pending explicit
  user instruction).
  - **Note:** npm `overrides` (`react-dom`, `expo-font`) are used to satisfy peer conflicts; see
    `context/architecture.md` §1.4 and `context/risk-register.md` R-23.


### [x] S02 — Design tokens and shared UI foundations

- **Objective:** Build the design-system layer: the Tailwind token set and the reusable components
  listed in `context/ui-context.md` §5.
- **Scope:** `src/components/ui/**` and the Tailwind configuration. No screens.
- **Prerequisites:** S01.
- **Tasks:**
  1. Finalise `tailwind.config.js` with the exact colour, spacing, radius, font-size and shadow
     tokens from `context/ui-context.md` §3. **Done:** the values live in
     `src/lib/theme/tokens.json` and `tailwind.config.js` consumes them.
  2. Build `src/components/ui/Icon.tsx` wrapping `lucide-react-native` (centralises
     `react-native-svg`).
  3. Build the primitive components: `Button`, `IconButton`, `Input`, `TextArea`, `Select`,
     `MultiSelect`, `PinInput`, `Checkbox`, `Card`, `Surface`, `ListItem`, `Badge`, `Avatar`,
     `Divider`, `KeyValue`, `Alert`, `Timeline`.
  4. Build the feedback components: `Sheet` (wrapping `@gorhom/bottom-sheet`), `Dialog`, `Toast`,
     `EmptyState`, `ErrorState`, `Skeleton`, `ProgressBar`, `Stepper`, `SegmentedControl`.
  5. Build `src/components/feedback/ErrorBoundary.tsx`.
  6. Export everything from `src/components/ui/index.ts` (barrel).
- **Deferred (approved with the maintainer):** `DateField` needs
  `@react-native-community/datetimepicker`; `Attachment` needs `expo-image-picker` (R-16, S19).
  `ToastHost` (the stacking provider) is built in S04. See R-25.
- **Expected files:** `tailwind.config.js`, `src/lib/theme/tokens.json`,
  `src/lib/theme/index.ts`, `src/components/ui/*.tsx` (27 files), `src/components/ui/index.ts`,
  `src/components/feedback/ErrorBoundary.tsx`, tests in `__tests__/`.
- **Data & state:** None. Components are controlled.
- **Acceptance criteria:**
  - [x] Every component renders in its default, loading, disabled and empty states.
  - [x] `Select` opens a bottom sheet, not a platform picker.
  - [x] `PinInput` supports paste and auto-advance (one field captures the whole code, so paste and
        advancing are native — there are no per-digit inputs).
  - [x] `Badge` always renders a text label alongside its colour.
  - [x] Every interactive component has an `accessibilityRole` and, where needed, an
        `accessibilityLabel`.
  - [x] No component imports from `src/features/**`.
  - [x] No `any`; `tsc --noEmit` and lint clean.
- **Tests:** One render test per component (at least the default state), plus a test asserting
  `Badge` renders its label text.
- **Definition of done:** The full component library exists, is tested and is exported from one
  barrel; no screen code exists yet.
- **Depends on:** S01.
- **Completed:** S02 — 54 tests pass, `typecheck`/`lint` clean. `DateField`, `Attachment` and
  `ToastHost` are deferred as recorded in R-25.

### [ ] S03 — Localization infrastructure

- **Objective:** Establish the EN/FR structure so that **no screen is ever built with hardcoded
  strings**.
- **Scope:** `src/lib/i18n/**` only.
- **Prerequisites:** S01.
- **Tasks:**
  1. Install `expo-localization` (`npx expo install expo-localization`).
  2. Create `src/lib/i18n/locales/en.ts` — the canonical key set, grouped by namespace
     (`common`, `welcome`, `request`, `child`, `need`, `contact`, `pin`, `review`, `dashboard`,
     `proposal`, `contract`, `invoice`, `payment`, `receipt`, `tutor`, `notification`, `admin`,
     `validation`, `error`, `status`).
  3. Create `src/lib/i18n/locales/fr.ts` typed as `Record<TranslationKey, string>`, so a missing
     French key is a compile error.
  4. Create `src/lib/i18n/index.ts` with `t(key, params?)`, interpolation (`{name}`) and explicit
     plural forms (`_one` / `_other`).
  5. Create `src/lib/i18n/locale.ts` — detect the device locale via `expo-localization`, default to
     `fr`, allow an explicit override persisted in the session store.
  6. Create the `useTranslation()` hook returning `{ t, locale, setLocale, isRTL }`.
  7. Create `src/lib/format/` — `formatAmount`, `formatDate`, `formatDateTime`, `formatRelativeTime`,
     all locale-aware via `Intl`.
- **Expected files:** `src/lib/i18n/index.ts`, `src/lib/i18n/locale.ts`,
  `src/lib/i18n/locales/en.ts`, `src/lib/i18n/locales/fr.ts`, `src/lib/i18n/types.ts`,
  `src/lib/format/*.ts`.
- **Data & state:** The locale override lives in the session store (created in S05's session slice
  or a minimal store created here if needed).
- **Acceptance criteria:**
  - [ ] Adding a key to `en.ts` without adding it to `fr.ts` produces a TypeScript error.
  - [ ] `t('key', { count: 3 })` interpolates correctly.
  - [ ] Plural rules differ between FR and EN for the same key.
  - [ ] `formatAmount(25, 'USD', 'fr')` → `25,00 $US`; in `en` → `USD 25.00`.
  - [ ] `formatDate` uses the active locale's date format.
  - [ ] No English or French string exists outside the dictionaries.
- **Tests:** A test asserting the FR dictionary covers every EN key and contains no empty value; a
  test for interpolation and plurals; a test for each formatter.
- **Definition of done:** The i18n layer is complete, tested and type-safe; `t()` is the only way
  to obtain a user-facing string.
- **Depends on:** S01.

### [ ] S04 — Application navigation shell

- **Objective:** Establish the Expo Router route tree, the layout hierarchy and the navigation
  conventions from `context/architecture.md` §3.
- **Scope:** `app/**` route files and navigation helpers. No screen content beyond placeholders.
- **Prerequisites:** S01, S02.
- **Tasks:**
  1. Create `app/_layout.tsx` — the root layout: providers (theme, i18n, error boundary, toast
     host), `GestureHandlerRootView` (**required by `Sheet`/`@gorhom/bottom-sheet`**, see R-25),
     `Stack`, splash-screen handling, `StatusBar`.
  2. Create `app/(client)/_layout.tsx` and `app/(admin)/_layout.tsx` — the two stacks, with the
     shared header options from `context/ui-context.md` §4.
  3. Create a placeholder route file for every route listed in `context/architecture.md` §3.1,
     each rendering its screen name — so the whole navigation tree is navigable from day one.
  4. Create `src/lib/navigation/routes.ts` — the typed route builders
     (`routes.proposal(id)`), so no screen builds a URL by string concatenation.
  5. Create `app/+not-found.tsx` and a `NotFound` component reused by screens that receive an
     unknown id.
  6. Add the admin "simulation" entry point from the Welcome screen (a clearly labelled link in
     the footer).
  7. Build the `ToastHost` provider in `src/components/feedback/` (the stacking/queuing host for
     the `Toast` built in S02).
- **Expected files:** `app/_layout.tsx`, `app/+not-found.tsx`, `app/(client)/_layout.tsx`,
  `app/(client)/**/*.tsx` (16 placeholders), `app/(admin)/_layout.tsx`, `app/(admin)/**/*.tsx`
  (9 placeholders), `src/lib/navigation/routes.ts`.
- **Data & state:** None.
- **Acceptance criteria:**
  - [ ] Every route in `context/architecture.md` §3.1 exists and is reachable.
  - [ ] The back gesture and the header back button behave identically.
  - [ ] The admin simulation is reachable from the Welcome screen and is visibly labelled as a
        simulation.
  - [ ] An unknown route shows the not-found state, not a crash.
  - [ ] `tsc --noEmit` and lint clean; navigation tests pass.
- **Tests:** A test that the route tree mounts; a test that an unknown dynamic id renders the
  not-found state.
- **Definition of done:** The complete navigation skeleton exists and is navigable; no screen logic
  beyond placeholders.
- **Depends on:** S01, S02.

---

## Phase 2 — The Client Request Journey

### [ ] S05 — Welcome screen

- **Objective:** Deliver the first screen the client sees, per `design.md` §"Welcome".
- **Scope:** `app/(client)/welcome.tsx` and the screen it renders.
- **Prerequisites:** S02, S03, S04.
- **Tasks:**
  1. Implement the Welcome screen per `design.md`: brand hero, a short value proposition, the
     primary CTA "Get Started" (FR: « Commencer »), the language switch, and the
     "Administration (simulation)" entry.
  2. Implement the "continue your request" bottom sheet, shown only when a persisted draft
     exists (the check is a no-op until S14 introduces persistence).
  3. Add the welcome copy to both dictionaries.
- **Expected files:** `app/(client)/welcome.tsx`, `src/features/request/screens/welcome-screen.tsx`,
  `src/features/request/components/welcome-hero.tsx`, dictionary updates.
- **Data & state:** Reads the draft store's existence flag.
- **Acceptance criteria:**
  - [ ] The screen renders in both FR and EN with no hardcoded string.
  - [ ] The primary CTA is the single dominant action.
  - [ ] The language switch changes all visible copy immediately, with no restart.
  - [ ] The admin simulation entry is visible and labelled.
  - [ ] The screen is usable at 360×640 dp.
- **Tests:** A render test (FR and EN), a test that the language switch changes the CTA label.
- **Definition of done:** The Welcome screen matches `design.md` and is fully localised.
- **Depends on:** S02, S03, S04.

### [ ] S06 — Request-type selection

- **Objective:** Let the client choose "for my child" or "for myself" via a bottom sheet, and route
  accordingly.
- **Scope:** `app/(client)/request-type.tsx`, the sheet component, and the routing decision.
- **Prerequisites:** S05.
- **Tasks:**
  1. Implement the request-type sheet per `design.md`: two large options with an icon, a title and
     a one-line explanation each.
  2. Implement the routing decision — "For my child" → the child list; "For myself" → the adult
     needs form.
  3. Record the chosen journey type in the request draft store.
  4. Add the copy to both dictionaries.
- **Expected files:** `app/(client)/request-type.tsx`,
  `src/features/request/screens/request-type-screen.tsx`,
  `src/features/request/components/request-type-options.tsx`, dictionary updates.
- **Data & state:** The draft store gains `journeyType: 'child' | 'self'`.
- **Acceptance criteria:**
  - [ ] The sheet is dismissible by swipe and by back, and dismissal returns to Welcome.
  - [ ] Each option navigates to the correct destination.
  - [ ] The selection is remembered if the user goes back and re-enters.
  - [ ] FR and EN copy both present.
- **Tests:** A test that each option routes to the expected route; a dismiss test.
- **Definition of done:** The request-type sheet works in both languages and routes correctly.
- **Depends on:** S05.

### [ ] S07 — Child list and child form

- **Objective:** Let a parent register, edit and remove multiple children.
- **Scope:** `src/features/children/**`, `app/(client)/children/**`.
- **Prerequisites:** S06.
- **Tasks:**
  1. Define the `Child` type and the Zod schema per `context/business-rules.md` §11.1.
  2. Implement the draft/record conversion helpers and their unit tests.
  3. Implement the child list screen (list + empty state + "add" CTA) per `design.md`.
  4. Implement the child form bottom sheet per `design.md`, with field-level validation and the
     blur/submit validation timing of `context/code-standards.md` §4.5.
  5. Implement edit and remove, with a confirmation dialog for removal.
  6. Add the copy to both dictionaries.
  7. Seed the draft store's `childIds` when the journey type is `child`.
- **Expected files:** `src/features/children/types.ts`, `src/features/children/validation.ts`,
  `src/features/children/components/child-list-item.tsx`,
  `src/features/children/screens/child-list-screen.tsx`,
  `src/features/children/screens/child-form-screen.tsx`, `app/(client)/children/index.tsx`,
  `app/(client)/children/form.tsx`, dictionary updates.
- **Data & state:** The children live in the request draft store until the request is submitted.
- **Acceptance criteria:**
  - [ ] Two children can be added, edited and removed.
  - [ ] The empty state renders when there are no children.
  - [ ] Validation rejects an empty first name, a missing level, and an out-of-range age/birth date.
  - [ ] Exactly one of `birthDate` / `age` is accepted.
  - [ ] Removing a child asks for confirmation.
  - [ ] The "Continue" action is enabled only when ≥ 1 child exists.
- **Tests:** Schema tests (valid + each invalid rule); a list render test; a form submit test; an
  add/edit/remove integration test through the store.
- **Definition of done:** The parent can build a list of children with validated data.
- **Depends on:** S06.

### [ ] S08 — Child needs

- **Objective:** Let a parent describe one or more learning needs per child.
- **Scope:** `src/features/request/**` (needs), `app/(client)/needs/child/[childId].tsx`.
- **Prerequisites:** S07.
- **Tasks:**
  1. Define the `LearningNeed` type and the Zod schema per `context/business-rules.md` §11.2,
     including the `location` conditional on `format`.
  2. Implement the needs screen per `design.md`: the child's existing needs, the add-need form
     (bottom sheet), and the tutor-preference control.
  3. Implement the multi-need list: each need is an independent item that can be edited or
     removed.
  4. Implement the tutor-preference control: *the same tutor if possible* / *different tutors* /
     *no preference*, with the explanatory note that it is a preference, not a guarantee.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/request/types.ts`, `src/features/request/validation.ts`,
  `src/features/request/components/need-list-item.tsx`,
  `src/features/request/components/need-form.tsx`,
  `src/features/request/components/tutor-preference.tsx`,
  `src/features/request/screens/child-needs-screen.tsx`,
  `app/(client)/needs/child/[childId].tsx`, dictionary updates.
- **Data & state:** Needs live in the draft store, keyed by `childId`.
- **Acceptance criteria:**
  - [ ] Two needs can be added to the same child; they appear as independent items.
  - [ ] Each need can be edited and removed independently.
  - [ ] `location` is required for `home` and `center`, optional for `online`.
  - [ ] The tutor-preference note states that it is not a guarantee.
  - [ ] A child with zero needs cannot continue.
  - [ ] Each child's needs are scoped to that child only.
- **Tests:** Schema tests including the conditional `location`; a test that two needs on one child
  coexist; a test that needs are isolated between children.
- **Definition of done:** Multi-need, multi-child capture works and is validated.
- **Depends on:** S07.

### [ ] S09 — Adult learning request

- **Objective:** Provide the same need-capture journey for an adult, without child registration.
- **Scope:** `src/features/request/**`, `app/(client)/needs/self.tsx`.
- **Prerequisites:** S06 (the routing already exists); reuses S08's need form.
- **Tasks:**
  1. Implement the adult needs screen per `design.md`, reusing the S08 need form and list items.
  2. Set `learnerIsClient: true` and `childIds: []` on the needs.
  3. Hide the tutor-preference control only if the business decides it applies to adults too —
     **default: it applies to both journeys** (the tutor-preference requirement is written in the
     parent journey section of the brief but is meaningful for adults as well). Record the
     decision in the risk register if it is changed.
  4. Add the copy to both dictionaries.
- **Expected files:** `src/features/request/screens/adult-needs-screen.tsx`,
  `app/(client)/needs/self.tsx`, dictionary updates.
- **Data & state:** The draft store's needs, with `learnerIsClient: true`.
- **Acceptance criteria:**
  - [ ] The adult journey never asks for a child.
  - [ ] The same validation rules apply as for a child.
  - [ ] At least one need is required to continue.
  - [ ] The adult needs are independent of any child record.
- **Tests:** A test that the adult flow creates no child record; a validation test.
- **Definition of done:** The adult journey mirrors the parent journey minus the children.
- **Depends on:** S06, S08 (reuses the need form).

### [ ] S10 — Contact details

- **Objective:** Collect the client's identity and contact details, with the phone number as the
  primary identifier.
- **Scope:** `src/features/client/**`, `app/(client)/contact.tsx`.
- **Tasks:**
  1. Define the contact schema per `context/business-rules.md` §11.3, including phone
     normalisation (accepts `+243…`, `0…` and local `8…` forms) and the RFC-lite email check.
  2. Implement the contact form per `design.md`.
  3. Implement the phone normalisation helper and its unit tests.
  4. Implement the "you already have an account with this number" path — if the phone matches an
     existing client, offer to continue as that client rather than creating a duplicate.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/client/types.ts`, `src/features/client/validation.ts`,
  `src/features/client/lib/phone.ts`, `src/features/client/screens/contact-screen.tsx`,
  `app/(client)/contact.tsx`, dictionary updates.
- **Data & state:** The draft store's contact section.
- **Acceptance criteria:**
  - [ ] The phone number is required and validated.
  - [ ] An invalid email is rejected; an empty email is accepted.
  - [ ] The normalised phone is stored, not the raw string.
  - [ ] An existing client with the same number is detected (no duplicate profile).
  - [ ] All errors are shown as text under the field.
- **Tests:** Phone normalisation tests (several formats), schema tests, a duplicate-detection test.
- **Definition of done:** Validated contact capture with correct phone normalisation.
- **Depends on:** S08, S09.

### [ ] S11 — PIN demonstration flow

- **Objective:** Let the client create and confirm a PIN, stored **only** as a salted hash, with the
  prototype limitation clearly stated in the UI.
- **Scope:** `src/features/client/**` (PIN + crypto), `app/(client)/pin.tsx`.
- **Tasks:**
  1. Implement `src/lib/crypto/pin.ts` — salt generation with `expo-crypto.getRandomBytes(16)` and
     `digestStringAsync(SHA-256, salt + ':' + pin)`, per `context/business-rules.md` §9.2.
  2. Implement the PIN screen per `design.md`: 4-digit entry, confirmation field, a clear
     explanation of what the PIN is for **and** that it is a demonstration, not real security.
  3. Implement the PIN schema (4 digits, must match).
  4. Store `{ pinHash, pinSalt }` on the client profile — never the plain PIN.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/lib/crypto/pin.ts`, `src/features/client/validation.ts`,
  `src/features/client/screens/pin-screen.tsx`, `app/(client)/pin.tsx`, dictionary updates.
- **Data & state:** The client profile draft in the store.
- **Acceptance criteria:**
  - [ ] The PIN must be exactly 4 digits.
  - [ ] A mismatched confirmation shows an inline error and does not advance.
  - [ ] The stored value is a hash + salt; the plain PIN appears nowhere in the persisted state
        (verified by a test inspecting the serialised state).
  - [ ] The screen states that this is a demonstration and not production authentication.
- **Tests:** Hash determinism (same salt + PIN → same hash; different salt → different hash), the
  "no plain PIN in the persisted state" test, a mismatch test.
- **Definition of done:** The PIN flow works and provably stores no plaintext.
- **Depends on:** S10.

### [ ] S12 — Request review and submission

- **Objective:** Let the client review the whole request, submit it, and receive a local reference
  and a confirmation.
- **Scope:** `src/features/request/**`, `app/(client)/review.tsx`, `app/(client)/submitted.tsx`.
- **Tasks:**
  1. Implement the review screen per `design.md`: children (or the adult learner), each child's
     needs, contact details, the tutor preference — with per-section edit links that return to
     the relevant step.
  2. Implement the submission service: validate that the request is complete (≥ 1 need, contact
     valid, PIN set), generate the request id and the human-readable reference, set the status to
     `received`, write the first `ActivityEvent`, and create the `request_received` notification.
  3. Implement the confirmation screen per `design.md`: the reference, what happens next, and the
     primary CTA to the dashboard.
  4. Implement the reference generator (`MP-2026-0148` style) as a pure function.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/request/services/submit-request.ts`,
  `src/features/request/lib/reference.ts`,
  `src/features/request/screens/review-screen.tsx`,
  `src/features/request/screens/submitted-screen.tsx`, `app/(client)/review.tsx`,
  `app/(client)/submitted.tsx`, dictionary updates.
- **Data & state:** The request moves from the draft store to the request store.
- **Acceptance criteria:**
  - [ ] The review lists every entered value correctly, in both journeys.
  - [ ] Submission is blocked when a required part is missing, with a clear message.
  - [ ] On submission a reference is generated, the status is `received`, an event is written and a
        notification is created.
  - [ ] The draft is cleared after a successful submission.
  - [ ] The confirmation screen explains the next step in plain language.
- **Tests:** A submission integration test (draft → submitted request, status, event, notification,
  cleared draft); an incomplete-request test; a reference-format test.
- **Definition of done:** The client can complete and submit a request and receives a reference.
- **Depends on:** S07, S08, S09, S10, S11.

---

## Phase 3 — Client Visibility

### [ ] S13 — Client dashboard

- **Objective:** Deliver the dashboard that answers "where does my request stand?", without turning
  it into an admin dashboard.
- **Scope:** `src/features/request/**`, `app/(client)/dashboard.tsx`.
- **Tasks:**
  1. Implement `deriveNextStep(context)` as a pure function, per `context/architecture.md` §8.4.
  2. Implement the dashboard per `design.md`: the status badge, the plain-language next step, the
     children and their needs, the proposal card (if any), the contract card, the invoice card,
     the payment status, the assigned tutor, and the notifications entry with an unread badge.
  3. Implement the request timeline (phases reached, the current one highlighted).
  4. Implement the empty state ("no request yet") with a CTA back to the request flow.
  5. Implement the "view all requests" list (a client may have several requests over time).
  6. Add the copy to both dictionaries.
- **Expected files:** `src/features/request/lib/derive-next-step.ts`,
  `src/features/request/components/request-status-card.tsx`,
  `src/features/request/components/need-summary-card.tsx`,
  `src/features/request/components/request-timeline.tsx`,
  `src/features/request/screens/dashboard-screen.tsx`, `app/(client)/dashboard.tsx`,
  dictionary updates.
- **Data & state:** Reads the request store, the domain store and the notification store.
- **Acceptance criteria:**
  - [ ] The dashboard shows the status, the next step and the needs.
  - [ ] `deriveNextStep` is pure and has a unit test for every phase.
  - [ ] The empty state renders when no request exists.
  - [ ] The dashboard shows no administrative controls.
  - [ ] The unread notification badge is visible.
- **Tests:** `deriveNextStep` unit tests (one per phase), a dashboard render test, an empty-state
  test.
- **Definition of done:** The client can always see the state of the request and what happens next.
- **Depends on:** S12.

### [ ] S14 — Local persistence and restoration checks

- **Objective:** Make everything survive an app restart, using the `StoragePort` abstraction.
- **Scope:** `src/lib/persistence/**`, the store wiring, and the restoration logic.
- **Prerequisites:** S12 (there is now real data worth persisting), S13.
- **Tasks:**
  1. Implement `src/lib/persistence/storage-port.ts` — the interface.
  2. Implement `src/lib/persistence/memory-storage-adapter.ts` — used by tests.
  3. Implement `src/lib/persistence/async-storage-adapter.ts` over
     `@react-native-async-storage/async-storage`.
  4. Wire the Zustand `persist` middleware to the port, with the key namespace
     `mon_precepteur/v2/<collection>/v1` from `context/architecture.md` §6.2.
  5. Implement the Zod validation of every persisted collection on read, with the "some data could
     not be restored" recovery notice from `context/architecture.md` §9.3.
  6. Implement the schema-version guard — a collection with an unknown version is discarded.
  7. Restore the draft on app start and surface the "continue your request" sheet on Welcome.
  8. Add the copy to both dictionaries.
- **Expected files:** `src/lib/persistence/storage-port.ts`,
  `src/lib/persistence/memory-storage-adapter.ts`,
  `src/lib/persistence/async-storage-adapter.ts`,
  `src/lib/persistence/persistence-config.ts`, store changes, dictionary updates.
- **Data & state:** Every store becomes persisted.
- **Acceptance criteria:**
  - [ ] Killing and relaunching the app restores the request, its status, the proposal, the
        payment and the receipt byte-for-byte.
  - [ ] The draft is restored and the "continue" sheet appears.
  - [ ] A corrupted record is dropped without crashing, and a notice is shown.
  - [ ] An unknown schema version is discarded rather than crashing.
  - [ ] The memory adapter and the AsyncStorage adapter pass the **same** store test suite.
  - [ ] No persisted state contains a plain PIN.
- **Tests:** A round-trip test per collection; a corruption-recovery test; a version-mismatch test;
  the shared store suite run against both adapters.
- **Definition of done:** Persistence works, is validated on read, and the adapter swap is proven to
  be non-invasive.
- **Depends on:** S12.

---

## Phase 4 — The Administrative Simulation

### [ ] S15 — Administrator simulation

- **Objective:** Create the admin workspace: the incoming-request list, the request detail, the
  tutor catalogue and the activity history — clearly labelled as a simulation.
- **Scope:** `src/features/admin/**`, `src/features/tutor/**`, `app/(admin)/**`.
- **Prerequisites:** S13, S14.
- **Tasks:**
  1. Implement the admin dashboard per `design.md`: the list of incoming requests with their
     status, a filter by status, and a simulation banner.
  2. Implement the request detail: the client, the children, the needs, the tutor preference, the
     activity history, and the contextual actions available for the current status.
  3. Define the `Tutor` type and seed a mock catalogue (≥ 8 tutors covering mathematics, French,
     English, physics, chemistry, science, informatics and exam preparation, across the `home`,
     `online` and `center` formats).
  4. Implement the activity-history view from the `ActivityEvent` records.
  5. Implement the transition service `startReview(requestId)` implementing T-02.
  6. Add the copy to both dictionaries (the admin namespace is FR-only for the prototype).
- **Expected files:** `src/features/tutor/types.ts`, `src/features/tutor/data/mock-tutors.ts`,
  `src/features/admin/screens/admin-dashboard-screen.tsx`,
  `src/features/admin/screens/admin-request-detail-screen.tsx`,
  `src/features/admin/screens/admin-history-screen.tsx`,
  `src/features/request/services/start-review.ts`, `app/(admin)/*.tsx`, dictionary updates.
- **Data & state:** The tutor catalogue is seeded on first run; the admin workspace reads the same
  stores.
- **Acceptance criteria:**
  - [ ] The admin simulation is clearly labelled as a simulation on every screen.
  - [ ] The request list shows the status of every request.
  - [ ] The request detail shows the client, the children and every need.
  - [ ] "Start the review" moves the request from `received` to `under_review` and writes an event.
  - [ ] The activity history lists the events in reverse chronological order.
  - [ ] The tutor catalogue contains at least 8 tutors with subjects and formats.
- **Tests:** A transition test for `startReview` (valid + invalid source status), a list render
  test, a catalogue-shape test.
- **Definition of done:** The administrator can inspect any request and move it into review.
- **Depends on:** S13, S14.

### [ ] S16 — Proposal workflow

- **Objective:** Let the administrator prepare and send a proposal, and let the client accept or
  reject it.
- **Scope:** `src/features/proposal/**`, `app/(admin)/proposal/new.tsx`,
  `app/(client)/proposal/[proposalId].tsx`.
- **Prerequisites:** S15.
- **Tasks:**
  1. Define the `Proposal` type and schema, including the guard that a need cannot be covered by
     two accepted proposals (G-05).
  2. Implement the proposal builder per `design.md`: pick the covered needs, pick the tutor, set
     the price, the billing cycle, the frequency, the session length, the duration and the
     conditions.
  3. Implement the transition service `sendProposal(requestId, input)` implementing T-03, with the
     `proposal_sent` notification.
  4. Implement the client proposal screen per `design.md`: the full terms, the accept and reject
     actions, and a rejection-reason sheet.
  5. Implement `decideProposal(proposalId, decision)` implementing T-04 / T-05, with the
     `proposal_accepted` / `proposal_rejected` notifications.
  6. Implement the "new proposal after a rejection" path (the previous proposal becomes
     `superseded`).
  7. Add the copy to both dictionaries.
- **Expected files:** `src/features/proposal/types.ts`, `src/features/proposal/validation.ts`,
  `src/features/proposal/services/send-proposal.ts`,
  `src/features/proposal/services/decide-proposal.ts`,
  `src/features/proposal/screens/proposal-builder-screen.tsx`,
  `src/features/proposal/screens/proposal-detail-screen.tsx`,
  `app/(admin)/proposal/new.tsx`, `app/(client)/proposal/[proposalId].tsx`, dictionary updates.
- **Data & state:** The proposal store (part of the domain store).
- **Acceptance criteria:**
  - [ ] A proposal covering two needs of one request can be created and sent.
  - [ ] The client can accept → the request becomes `proposal_accepted` and a contract can be
        created.
  - [ ] The client can reject with a reason → the request becomes `proposal_rejected` and stays
        open.
  - [ ] A proposal sent to the wrong request, or covering a need already covered by an accepted
        proposal, is rejected.
  - [ ] A decision on an already-decided proposal is rejected.
  - [ ] Every transition writes an event and a notification.
- **Tests:** Transition tests for accept and reject (plus every invalid transition), a guard test for
  G-05, a builder validation test.
- **Definition of done:** The proposal round-trip works and every guard holds.
- **Depends on:** S15.

### [ ] S17 — Contract workflow simulation

- **Objective:** Prepare, issue and sign a contract, with the signature clearly labelled as a
  simulation and the terms clearly labelled as placeholder wording.
- **Scope:** `src/features/contract/**`, `app/(admin)/contract/new.tsx`,
  `app/(client)/contract/[contractId].tsx`.
- **Tasks:**
  1. Define the `Contract` type and schema; implement the unique contract number.
  2. Implement the contract preparation screen per `design.md`.
  3. Implement `issueContract(proposalId, input)` implementing the contract transitions.
  4. Implement the client contract screen per `design.md`: the terms, a signature sheet (typed
     name), and the simulated-signature notice.
  5. Implement `signContract(contractId, name)` implementing T-08, storing `signatureSimulated:
     true`.
  6. Add the copy to both dictionaries.
- **Expected files:** `src/features/contract/types.ts`, `src/features/contract/validation.ts`,
  `src/features/contract/services/issue-contract.ts`,
  `src/features/contract/services/sign-contract.ts`,
  `src/features/contract/screens/contract-builder-screen.tsx`,
  `src/features/contract/screens/contract-detail-screen.tsx`,
  `app/(admin)/contract/new.tsx`, `app/(client)/contract/[contractId].tsx`, dictionary updates.
- **Data & state:** The contract store.
- **Acceptance criteria:**
  - [ ] A contract can only be created from an **accepted** proposal.
  - [ ] The client can only sign a contract in the `issued` state.
  - [ ] The signature records the typed name, the timestamp and `signatureSimulated: true`.
  - [ ] The UI states that the signature is a demonstration and that the terms are placeholders
        requiring legal validation in the DRC.
  - [ ] Signing moves the request to `contract_signed`.
  - [ ] Duplicate contract numbers are rejected.
- **Tests:** Transition tests for issue and sign (plus the invalid ones), a uniqueness test, a
  "signature is simulated" assertion.
- **Definition of done:** The contract round-trip works and its prototype limits are explicit in the
  UI.
- **Depends on:** S16.

### [ ] S18 — Invoice workflow

- **Objective:** Create and issue an invoice for an accepted proposal.
- **Scope:** `src/features/invoice/**`, `app/(admin)/invoice/new.tsx`,
  `app/(client)/invoice/[invoiceId].tsx`.
- **Tasks:**
  1. Define the `Invoice` type and schema; implement the unique invoice number and the default
     amount derived from the proposal.
  2. Implement the invoice preparation screen per `design.md`.
  3. Implement `issueInvoice(proposalId, input)` implementing the invoice transitions and T-09
     (the request moves to `awaiting_payment`).
  4. Implement the client invoice screen per `design.md`: the number, the covered needs, the
     amount, the issue date, the due date and the status.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/invoice/types.ts`, `src/features/invoice/validation.ts`,
  `src/features/invoice/services/issue-invoice.ts`,
  `src/features/invoice/screens/invoice-builder-screen.tsx`,
  `src/features/invoice/screens/invoice-detail-screen.tsx`,
  `app/(admin)/invoice/new.tsx`, `app/(client)/invoice/[invoiceId].tsx`, dictionary updates.
- **Data & state:** The invoice store.
- **Acceptance criteria:**
  - [ ] An invoice can only be created from an accepted proposal.
  - [ ] The amount defaults to the proposal price and remains editable.
  - [ ] The invoice number is unique.
  - [ ] The client sees the number, the needs, the amount, the dates and the status.
  - [ ] Issuing the invoice moves the request to `awaiting_payment`.
- **Tests:** Transition tests, a uniqueness test, a default-amount test.
- **Definition of done:** The invoice round-trip works and is visible to the client.
- **Depends on:** S17.

### [ ] S19 — Mobile Money payment declaration

- **Objective:** Let the client declare a Mobile Money payment, with a duplicate-transaction-ID
  guard, and never auto-confirm it.
- **Scope:** `src/features/payment/**`, `app/(client)/payment/[invoiceId].tsx`.
- **Prerequisites:** S18.
- **Tasks:**
  1. Define the `Payment` type and the schema from `context/business-rules.md` §11.5.
  2. Implement the payment declaration screen per `design.md`: the transaction ID, the payer's
     phone, the amount, the operator, the payment date and the optional evidence.
  3. Implement the optional evidence attachment with `expo-image-picker` (conditional dependency —
     **only if the scope decision in `context/risk-register.md` is approved**; otherwise the field
     is hidden).
  4. Implement `declarePayment(invoiceId, input)` implementing P-01 … P-08, including the
     duplicate detection (P-04) that records a `duplicate` payment for the audit trail while
     showing the client an explanatory error.
  5. Implement the amount-equality guard (P-02) with a precise message.
  6. Add the copy to both dictionaries.
- **Expected files:** `src/features/payment/types.ts`, `src/features/payment/validation.ts`,
  `src/features/payment/services/declare-payment.ts`,
  `src/features/payment/screens/payment-declaration-screen.tsx`,
  `app/(client)/payment/[invoiceId].tsx`, dictionary updates.
- **Data & state:** The payment store.
- **Acceptance criteria:**
  - [ ] A declaration always creates a payment in `pending_verification` — never `confirmed`.
  - [ ] A transaction ID that already exists is rejected, and a `duplicate` record is created for
        the audit trail.
  - [ ] A declared amount different from the invoice amount is rejected with a clear message.
  - [ ] A future payment date, or one older than 90 days, is rejected.
  - [ ] The payer's phone may differ from the client's phone.
  - [ ] The invoice status becomes `awaiting_payment` and the request stays there.
  - [ ] The screen states that the payment will be verified manually.
- **Tests:** A declaration test asserting the status is `pending_verification`, a duplicate test
  asserting both the rejection and the audit record, an amount-mismatch test, a date-range test.
- **Definition of done:** The client can declare a payment and the system never treats it as paid.
- **Depends on:** S18.

### [ ] S20 — Administrative payment verification

- **Objective:** Let the administrator confirm or reject a declared payment, with the invoice
  amount shown side by side with the declared amount.
- **Scope:** `src/features/payment/**`, `app/(admin)/payment/[paymentId].tsx`.
- **Prerequisites:** S19.
- **Tasks:**
  1. Implement the verification screen per `design.md`: the declared details, the invoice amount,
     a duplicate warning if the transaction ID appears elsewhere, and the extra checks of
     `context/business-rules.md` §6.5 (as an explicitly labelled placeholder).
  2. Implement `verifyPayment(paymentId, 'confirmed' | 'rejected', reason?)` implementing V-01 …
     V-05 and T-10.
  3. Implement the rejection sheet with a required reason.
  4. Implement the duplicate warning: the same transaction ID already used by another payment.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/payment/screens/payment-verification-screen.tsx`,
  `src/features/payment/services/verify-payment.ts`, `app/(admin)/payment/[paymentId].tsx`,
  dictionary updates.
- **Data & state:** The payment, invoice and request stores.
- **Acceptance criteria:**
  - [ ] Only a `pending_verification` payment can be confirmed or rejected.
  - [ ] Confirming sets the invoice to `paid` and the request to `payment_verified`.
  - [ ] Rejecting requires a reason, keeps the invoice `awaiting_payment` and notifies the client.
  - [ ] A duplicate transaction ID is visibly flagged to the administrator.
  - [ ] A confirmed payment can never transition again.
  - [ ] Every verification writes an event and a notification.
- **Tests:** Transition tests for confirm and reject (plus every invalid transition), a
  duplicate-warning test, a "cannot re-verify" test.
- **Definition of done:** Manual verification works and no path auto-confirms a payment.
- **Depends on:** S19.

### [ ] S21 — Receipt generation

- **Objective:** Generate a receipt **only** for a confirmed payment, and show it to the client.
- **Scope:** `src/features/receipt/**`, `app/(admin)/receipt/issue.tsx`,
  `app/(client)/receipt/[receiptId].tsx`.
- **Prerequisites:** S20.
- **Tasks:**
  1. Define the `Receipt` type and the unique receipt number.
  2. Implement the receipt generation inside the confirmation path (V-02) — there must be **no**
     other code path that creates a receipt.
  3. Implement the receipt issuance screen per `design.md`.
  4. Implement the client receipt screen per `design.md`: the number, the amount, the date, the
     invoice reference and the verified transaction ID.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/receipt/types.ts`, `src/features/receipt/services/issue-receipt.ts`,
  `src/features/receipt/screens/receipt-screen.tsx`, `app/(admin)/receipt/issue.tsx`,
  `app/(client)/receipt/[receiptId].tsx`, dictionary updates.
- **Data & state:** The receipt store.
- **Acceptance criteria:**
  - [ ] Confirming a payment automatically creates exactly one receipt.
  - [ ] A rejected, pending or duplicate payment has **no** receipt — verified by a test that
        asserts the receipt count is zero in each case.
  - [ ] The receipt number is unique.
  - [ ] The receipt copies the amount from the confirmed payment.
  - [ ] The client can find the receipt from the dashboard.
- **Tests:** A receipt-created-on-confirmation test, three "no receipt" tests, a uniqueness test.
- **Definition of done:** Receipts exist if and only if a payment is confirmed.
- **Depends on:** S20.

### [ ] S22 — Tutor assignment

- **Objective:** Assign tutors per need, supporting several tutors for one child and one tutor for
  several needs.
- **Scope:** `src/features/tutor/**`, `app/(admin)/assignment.tsx`,
  `app/(client)/tutor/[needId].tsx`.
- **Tasks:**
  1. Define the `TutorAssignment` type and schema.
  2. Implement the assignment screen per `design.md`: the needs of the request, the candidate
     tutors filtered by subject and format, the existing assignments, and the tutor-preference
     reminder.
  3. Implement `assignTutor(needId, tutorId)` implementing the assignment transitions and T-11,
     with the guard G-09 and G-10.
  4. Implement `activateAssignment(assignmentId)` implementing T-11 and the checks of
     `context/business-rules.md` §6.5.
  5. Implement the client tutor screen per `design.md`: the tutor's name, contact, subject and
     the agreed format and schedule.
  6. Add the copy to both dictionaries.
- **Expected files:** `src/features/tutor/types.ts`, `src/features/tutor/validation.ts`,
  `src/features/tutor/services/assign-tutor.ts`,
  `src/features/tutor/services/activate-assignment.ts`,
  `src/features/tutor/screens/assignment-screen.tsx`,
  `src/features/tutor/screens/assigned-tutor-screen.tsx`, `app/(admin)/assignment.tsx`,
  `app/(client)/tutor/[needId].tsx`, dictionary updates.
- **Data & state:** The assignment store.
- **Acceptance criteria:**
  - [ ] Two needs of the same child can be assigned to two different tutors.
  - [ ] Two needs can be assigned to the same tutor.
  - [ ] A need cannot have two active assignments.
  - [ ] An inactive tutor, or one who does not support the need's subject or format, cannot be
        assigned.
  - [ ] The request only reaches `in_service` when every need has an active assignment and the
        payment is verified (G-13).
  - [ ] The client sees the assigned tutor's details.
- **Tests:** Assignment tests (one tutor / several needs, several tutors / one child), the
  duplicate-active-assignment test, the ineligible-tutor test, the G-13 transition test.
- **Definition of done:** Per-need assignment works in all the required combinations.
- **Depends on:** S21.

### [ ] S23 — Notifications simulation

- **Objective:** Make the in-app notification centre complete: generation from domain events, the
  list, the unread badge, and reading.
- **Scope:** `src/features/notification/**`, `app/(client)/notifications.tsx`.
- **Tasks:**
  1. Define the `Notification` type and the `NotificationType` union from
     `context/architecture.md` §7.3.
  2. Implement the notification generator, invoked by the transition services (N-01).
  3. Implement the notification centre per `design.md`: the list, grouped by day, with the unread
     marker; the empty state; the read state.
  4. Implement the unread badge on the dashboard entry point.
  5. Add the copy to both dictionaries.
- **Expected files:** `src/features/notification/types.ts`,
  `src/features/notification/services/create-notification.ts`,
  `src/features/notification/screens/notifications-screen.tsx`,
  `app/(client)/notifications.tsx`, dictionary updates.
- **Data & state:** The notification store (persisted).
- **Acceptance criteria:**
  - [ ] Every type in `context/architecture.md` §7.3 can be produced and is listed.
  - [ ] Notifications store i18n keys, so they re-render in the new language after a switch.
  - [ ] Reading a notification sets `readAt` and does not mutate any domain entity.
  - [ ] The badge count reflects the unread notifications.
  - [ ] The UI states that notifications are in-app only — no SMS or WhatsApp is sent.
- **Tests:** A generation test per notification type, a read test asserting no domain mutation, a
  badge-count test, a language-switch re-render test.
- **Definition of done:** The notification centre is complete and honest about its delivery scope.
- **Depends on:** S16, S22.

---

## Phase 5 — Hardening

### [ ] S24 — English/French localisation review

- **Objective:** Verify that the whole client-facing interface is complete and correct in both
  languages.
- **Scope:** The dictionaries and every screen's copy. No new features.
- **Prerequisites:** S23.
- **Tasks:**
  1. Audit every screen for hardcoded strings and move them into the dictionaries.
  2. Complete the FR dictionary for every client-facing key (the admin namespace stays FR-only by
     decision).
  3. Review the French wording for register, courtesy and clarity (the second person, plain
     language).
  4. Review the layout at both languages for text expansion — no truncation, no clipped buttons.
  5. Verify the notification bodies and status labels in both languages.
  6. Verify the date, number and currency formatting per locale.
- **Expected files:** `src/lib/i18n/locales/en.ts`, `src/lib/i18n/locales/fr.ts`, and any screen
  files that needed a copy change.
- **Data & state:** None.
- **Acceptance criteria:**
  - [ ] No user-facing string exists outside the dictionaries (verified by a grep-based test).
  - [ ] Every EN key has a non-empty FR value (enforced by the type and by a test).
  - [ ] No screen truncates text in either language.
  - [ ] The language switch changes every visible string, including past notifications.
  - [ ] The date, amount and relative-time formats differ correctly between FR and EN.
- **Tests:** A dictionary-parity test, a hardcoded-string scan test, a locale-formatting test.
- **Definition of done:** The client experience is fully bilingual.
- **Depends on:** S23.

### [ ] S25 — End-to-end testing and usability review

- **Objective:** Validate the whole journey end to end, on a small screen, in both languages, and
  record the outcome.
- **Scope:** Testing and fixes only. New features are out of scope.
- **Prerequisites:** S24.
- **Tasks:**
  1. Write and run the full end-to-end scenario from `context/test-plan.md` §2 (parent journey) and
     §3 (adult journey), including the multi-child, multi-need and multi-tutor cases.
  2. Run the automated suite, `typecheck` and `lint`; fix every failure.
  3. Manual usability pass at 360×640 dp, in FR and in EN, covering the empty, loading, error and
     success states of every screen.
  4. Verify the persistence round-trip after a real app restart.
  5. Verify every "simulation" is labelled in the UI and that no screen implies a real SMS, a
     real payment verification or a legally valid signature.
  6. Write the findings into `context/progress-tracker.md` and close the remaining items in
     `context/risk-register.md` that are no longer open.
- **Expected files:** `src/features/**/__tests__/e2e-*.test.ts`, and fixes wherever they are needed.
- **Data & state:** None.
- **Acceptance criteria:**
  - [ ] The full parent journey completes end to end in a test: request → proposal → contract →
        invoice → declaration → verification → receipt → assignment → service.
  - [ ] The full adult journey completes end to end.
  - [ ] The multi-tutor scenario works (two tutors for one child).
  - [ ] `typecheck`, `lint` and `test` all pass.
  - [ ] The 360×640 dp pass finds no clipped or unreachable content.
  - [ ] Every simulation is labelled.
  - [ ] `context/progress-tracker.md` records the final state.
- **Tests:** The end-to-end suites themselves.
- **Definition of done:** The prototype demonstrates the complete managed workflow and passes every
  automated check.
- **Depends on:** S24.

---

## Dependency Graph

```
S01 ─► S02 ─► S04 ─► S05 ─► S06 ─┬─► S07 ─► S08 ─┬─► S10 ─► S11 ─► S12 ─► S13 ─► S14 ─► S15
        │                          └─► S09 ──────┘                                        │
        └─► S03 ─────────────────────────────────────────┘                                 │
                                                                                          ▼
                                                          S16 ─► S17 ─► S18 ─► S19 ─► S20 ─► S21 ─► S22
                                                            │                                            │
                                                            └──────────────► S23 ◄──────────────────────┘
                                                                                   │
                                                                                   ▼
                                                                                 S24 ─► S25
```

**Critical path:** S01 → S02 → S04 → S05 → S06 → S07 → S08 → S10 → S11 → S12 → S13 → S14 →
S15 → S16 → S17 → S18 → S19 → S20 → S21 → S22 → S23 → S24 → S25.

**Parallelisable:** S03 (localisation) can run alongside S02; S09 (adult journey) can run
alongside S07/S08 once S06 is done.
