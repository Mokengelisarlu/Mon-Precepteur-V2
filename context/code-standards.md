# Code Standards — Mon Précepteur V2

> Context file 4 of 6 (core context system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/ai-workflow-rules.md`,
> `context/progress-tracker.md`.
> UI/UX source of truth: `design.md`.

These rules are **mandatory**. A change that violates one is either corrected or the rule is
explicitly amended in this file first.

---

## 1. TypeScript

### 1.1 Strictness

The project compiles with `strict: true` plus:

```jsonc
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"noFallthroughCasesInSwitch": true,
"forceConsistentCasingInFileNames": true,
"skipLibCheck": true
```

`tsc --noEmit` must be clean. There is no "check later" state.

### 1.2 `any`

`any` is **forbidden by default**.

| Situation | Allowed? |
|---|---|
| A third-party library genuinely lacks types | `unknown` + a narrow type guard in a single wrapper file — never `any` |
| A value is genuinely untyped JSON | `unknown`, then parsed with Zod |
| A test fixture is intentionally malformed | A dedicated `const malformed: unknown = …` |
| An explicit business need | **Only with a written justification in the PR/commit message and a `TODO(owner):` comment** naming the replacement |

`unknown` is the correct escape hatch. `as` assertions to silence the compiler are treated the same
way as `any` and require justification.

`@typescript-eslint/no-explicit-any` is an **error**, not a warning, in the ESLint config.

### 1.3 Types over interfaces for unions; interfaces for objects

```ts
// Union of literals → type alias
export type RequestStatus = 'received' | 'under_review' | 'proposal_sent' | …;

// Object shape → interface
export interface Request {
  id: string;
  status: RequestStatus;
}
```

### 1.4 `enum` is forbidden

Use string-literal unions. They serialise cleanly to JSON, are readable in error messages, and
require no reverse-mapping code.

```ts
// Forbidden
enum RequestStatus { Received = 'received' }

// Required
export type RequestStatus = 'received' | 'under_review';
```

### 1.5 Discriminated unions for entity variants

Where an entity has meaningfully different shapes (parent request vs adult request), model it as a
discriminated union so the compiler enforces the invariant:

```ts
export type Request =
  | { type: 'child'; childIds: [string, ...string[]]; learnerIsClient: false }
  | { type: 'self'; childIds: []; learnerIsClient: true };
```

### 1.6 `readonly` on domain data

Domain entity interfaces use `readonly` properties. Zustand's `set` produces new objects; the
immutability is a runtime guarantee of the library.

---

## 2. Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Files | kebab-case | `child-form-screen.tsx` |
| Components | PascalCase | `ChildListItem` |
| Hooks | camelCase, `use` prefix | `useRequestDraft` |
| Stores | camelCase, `use` prefix, `-store` suffix | `useRequestDraftStore` |
| Types & interfaces | PascalCase | `LearningNeed` |
| Type aliases for unions | PascalCase | `RequestStatus` |
| Constants | UPPER_SNAKE_CASE | `SESSION_DURATION_OPTIONS` |
| Functions | camelCase, verb-first | `deriveNextStep`, `buildProposal` |
| Booleans | `is` / `has` / `can` / `should` prefix | `isConfirmed`, `hasActiveAssignment` |
| Event handlers | `handle` + PascalCase | `handleSubmit` |
| Props | `Props` suffix on the interface | `ChildFormProps` |
| i18n keys | dotted, lowercase, namespaced | `validation.need.subject` |
| Entity ID prefixes | lowercase + underscore | `req_`, `prp_`, `inv_` |
| Storage keys | `mon_precepteur/v2/<collection>/v1` | `mon_precepteur/v2/requests/v1` |

### 2.1 Import ordering

Imports are ordered: **external → internal → relative**, with a blank line between groups, and
within a group, alphabetically.

```ts
// 1. External
import { z } from 'zod';
import { Pressable, View } from 'react-native';

// 2. Internal (path alias @/)
import { Button } from '@/components/ui';
import { useRequestStore } from '@/store/request-store';
import type { LearningNeed } from '@/types';

// 3. Relative
import { deriveNextStep } from './derive-next-step';
```

`import type` is used for type-only imports. Named imports are preferred over namespace imports
except for the deliberate `import * as Icons` pattern inside `src/components/ui/Icon.tsx`.

### 2.2 Path alias

`@/*` maps to `./src/*`. App-level files (`app/**`) import via `@/…`.

---

## 3. Component Organisation

### 3.1 Location

| Kind of component | Location |
|---|---|
| Generic, design-system | `src/components/ui/` |
| Cross-feature feedback | `src/components/feedback/` |
| Domain-specific | `src/features/<domain>/components/` |
| Screen | `src/features/<domain>/screens/` (rendered by a route file in `app/`) |

A route file in `app/` is a **thin composition layer** — it wires a screen to the store and the
navigation, and contains no business logic and no layout beyond the screen shell.

### 3.2 Component structure

```tsx
interface ChildListItemProps {
  child: Child;
  onPress: (child: Child) => void;
}

export function ChildListItem({ child, onPress }: ChildListItemProps): React.JSX.Element {
  // Props destructured in the signature.
  // Hooks.
  // Handlers.
  // Render.
}
```

Rules:

- **One component per file**, except trivial co-located sub-components used only by their parent.
- **Named exports**, never default exports (except route files, which Expo Router requires to
  default-export).
- Props are typed with an explicit `Props` interface.
- Components are **pure by default**: no store access, no navigation inside the component body.
  A screen passes data and callbacks down. Only screens may call hooks that use the store or the
  router.
- **No inline object literals in `style` props that are not static** — use `StyleSheet.create` or
  memoised styles. NativeWind class names are preferred for static styling.

### 3.3 Design-system components

`src/components/ui/` components must:

- accept a `className` prop so consumers can adjust layout,
- accept `accessibilityLabel` where they render text,
- support a loading/disabled state where meaningful,
- never import from `src/features/**`.

---

## 4. Forms & Validation

### 4.1 Stack

- **React Hook Form** for form state and touched/dirty tracking.
- **Zod** for the schema.
- **`@hookform/resolvers/zod`** to connect them.

### 4.2 Schema placement

Schemas live with their domain: `src/features/<domain>/validation.ts` (or inside `types.ts` for
small domains). **A schema is never declared inline in a screen.**

### 4.3 Reuse

The same Zod schema is used for:

1. form validation (`resolver`),
2. persistence validation (parsing what comes out of AsyncStorage),
3. service input validation (parsing what arrives from an admin screen).

One schema, three uses. This is what prevents validation drift.

### 4.4 Draft vs record

Form models are **separate types** from persisted records where the shapes differ (e.g. the age
field is a string in the form and a number in the record). The conversion functions are pure and
unit-tested:

```ts
export function draftToRecord(draft: ChildDraft): Omit<Child, 'id' | 'createdAt' | 'updatedAt'>
export function recordToDraft(record: Child): ChildDraft
```

### 4.5 Validation timing

- **On blur** for a single field.
- **On submit** for the whole form.
- Never on every keystroke for text fields (it produces hostile UX).
- The first errored field receives focus on a failed submit.

### 4.6 Error messages

All validation messages are **i18n keys**, resolved at render time. A raw string from a Zod
schema must not reach the UI. The pattern:

```ts
const schema = z.object({
  subject: z.string().trim().min(2, 'validation.need.subject'),
});
```

The screen maps the key to a translated sentence, with a fallback to a generic message when the key
is missing.

---

## 5. State Management

### 5.1 Division of responsibility

| State | Where it lives |
|---|---|
| Server-like domain data | Zustand stores |
| Transient UI state (open sheet, selected tab, text in a non-form input) | Local `useState` in the component |
| Form state | React Hook Form |
| Derived values | A pure function in `src/features/<domain>/services/` — **never stored** |

### 5.2 Store rules

- A store holds **serialisable data only**.
- A store action is the **only** way to mutate a store.
- A store action **returns a `Result`**, never throws.
- A store action does **not** contain business rules; it delegates to a service function.
- No store imports a component or a screen.
- A store name is `<domain>-store.ts` and exports exactly one hook, `use<Domain>Store`.

### 5.3 Service rules

- Services are **pure-ish**: they take state and inputs and return a new state or a `Result`. Where
  they must write, they receive the store actions as an argument so the service stays testable
  without a store instance.
- A service contains **exactly one** business operation, named after that operation
  (`acceptProposal`, `verifyPayment`, `assignTutor`).
- A service never imports React or the router.

### 5.4 Avoiding duplicated business logic

This is a **hard rule**, because duplication is how a prototype starts disagreeing with itself.

1. **A rule lives in exactly one place.** Status transitions live in
   `src/features/<domain>/services/transitions.ts` — never re-implemented in a screen, a store or a
   component.
2. **A validation rule lives in exactly one place** — a Zod schema (§4).
3. **A derived value lives in exactly one place** — a pure function (`deriveNextStep`,
   `canTransition`, `formatAmount`, `formatDate`).
4. **A status label lives in exactly one place** — the i18n dictionary, under `status.*`.
5. **A number lives in exactly one place** — a constant (`SESSION_DURATION_OPTIONS`, `MOBILE_MONEY_OPERATORS`).
   No literal `30`, `45`, `60` in a component.
6. **If a rule appears twice, one of the two copies is deleted** — not extracted into a third
   "shared" file that both then import. Extract only when a genuine third consumer appears.

---

## 6. Error Handling

- Services and store actions return `Result<T, AppError>`; they never throw.
- `AppError.message` is an **i18n key**, not a literal string.
- `error.code` is a discriminated literal from `AppErrorCode`; the UI may branch on the code
  (e.g. `DUPLICATE_TRANSACTION` shows a specific message and a link to the payment screen).
- Components branch on `result.ok`; they never use `try/catch` for expected failures.
- `try/catch` is used **only** around genuinely exceptional operations (storage I/O, native module
  calls) and always converts the thrown value into a `Result`.
- **Never swallow an error.** An empty `catch {}` block is a lint error.
- User-facing errors are written in the second person and say what to do next
  ("Ce code a déjà été utilisé. Vérifiez votre reçu et réessayez.").

---

## 7. Accessibility Standards (code level)

- Every `Pressable` / `TouchableOpacity` has an `accessibilityRole` and, where the label is not
  visible text, an `accessibilityLabel`.
- Decorative icons are wrapped in a `View` with `accessibilityElementsHidden` /
  `importantForAccessibility="no-hide-descendants"`.
- Status changes are announced with `AccessibilityInfo.announceForAccessibility`.
- Touch targets: `hitSlop` is used to bring small icons up to 44×44 dp.
- `Text` components use the `allowFontScaling` default (true) and are never placed in a
  fixed-height container that would clip the scaled text.
- No information is conveyed by colour alone.

---

## 8. Dependency Management

### 8.1 Rules

1. **Every dependency must be justified** in `context/step-features.md` before it is added. "It
   might be useful" is not a justification.
2. **Expo packages are installed with `npx expo install`**, which pins the SDK-57-compatible
   version. Never hand-write an `expo-*` version.
3. **Version pinning** follows the workspace convention (`context/architecture.md` §1.2): `expo-*`
   tilde, `react-native`/`react`/`reanimated`/`worklets`/`svg`/`async-storage` exact, third-party
   caret.
4. **Native modules are added one at a time**, each followed by a build check. Bundling several
   native modules into one step makes failures hard to isolate.
5. **No package is added for a single small function.** The threshold for adding a dependency is
   "it replaces ≥ 100 lines of our own code, or it does something native that cannot be done in
   JS".
6. **No dependency may be used directly outside `src/components/ui/`** if it is a UI library
   (see `context/architecture.md` §11.1 rule 6).
7. The lockfile is committed.

### 8.2 Dependency additions already approved

| Package | Step | Justification |
|---|---|---|
| `expo-localization` | 3 | Device-locale detection for the EN/FR switch. First-party Expo module. |
| `expo-image-picker` | 18 *(conditional)* | Optional payment evidence attachment. Only if the scope decision is approved. |

---

## 9. Testing Expectations

### 9.1 What must be tested

| Layer | Requirement |
|---|---|
| Domain services (transitions, guards, derivations) | **Every** business rule in `context/business-rules.md` has at least one test. |
| Zod schemas | Each schema has a valid-case test and an invalid-case test per rule. |
| Pure formatters (`formatAmount`, `formatDate`, `deriveNextStep`) | Fully covered. |
| Store + persistence | Round-trip: write → read → identical state, for every persisted collection. |
| Shared UI components | Rendered with react-native-testing-library; states: default, loading, empty, error, disabled. |
| Screens | Smoke render + the primary happy path. |
| i18n | A test asserts the FR dictionary covers every EN key and that no value is empty. |
| Manual | Usability, small screens, visual review, real device (see `context/test-plan.md`) |

### 9.2 Test placement

```
src/features/<domain>/__tests__/<name>.test.ts
src/components/ui/__tests__/<name>.test.tsx
src/lib/**/__tests__/<name>.test.ts
```

Tests live **next to the code they test**. There is no top-level `tests/` directory.

### 9.3 Naming

`describe('<unit under test>')` → `it('should <expected behaviour>')`. Tests describe behaviour, not
implementation.

### 9.4 Commands

| Command | Purpose |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Jest (full suite) |
| `npm test -- --watch` | Watch mode |
| `npm run test:coverage` | Coverage report |

**All four must pass before a step is reported as complete.**

### 9.5 Coverage expectations

No global coverage threshold is enforced in the prototype. Domain services and schemas are expected
to be near-complete. Coverage is a signal, not a gate.

---

## 10. Formatting & Linting

- ESLint with `eslint-config-expo` in **flat config** format (`eslint.config.js`), extending
  `expo/flat`, plus `@typescript-eslint` rules (`no-explicit-any: error`,
  `no-unused-vars: error`, `consistent-type-imports`).
- **Prettier is not used** in this project (no Prettier configuration exists anywhere in the
  workspace). Formatting follows the surrounding code.
- Editor defaults: 2-space indentation, single quotes, semicolons, trailing commas, 100-column
  soft limit.
- No `console.log` in committed code — use the toast/logger abstraction if one exists.

---

## 11. Git Hygiene

- The repository is initialised with Git in **Step 1** (it is currently not a repository).
- One commit per roadmap step, with a message referencing the step ID:
  `feat(step-04): welcome screen`.
- Never commit `node_modules`, `.expo/`, `dist/`, `*.log`, or local secrets.
- `.env*` files are ignored. **The prototype needs no secrets** — there is no backend and no API
  key.

---

## 12. Documentation Obligations

| Change | Must update |
|---|---|
| A new screen | `design.md` |
| A new state or transition | `context/business-rules.md` |
| A new entity or field | `context/architecture.md` §7 |
| A new i18n key | The `en` and `fr` dictionaries in the same commit |
| A new dependency | `context/architecture.md` §1 + `context/step-features.md` |
| A changed decision | `context/risk-register.md` |
| A completed step | `context/progress-tracker.md` + `context/step-features.md` checkbox |
