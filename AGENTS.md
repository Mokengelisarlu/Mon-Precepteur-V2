# AGENTS.md — Mon Précepteur V2

> Instructions for every AI agent and subagent working on this repository.
> **Read this file completely before touching any code.**
> Read the exact versioned Expo docs at <https://docs.expo.dev/versions/v57.0.0/> before writing any
> code — Expo SDK 57 is the target and the API surface changes between SDKs.

---

## 1. Project Identity

**Mon Précepteur V2** is a mobile-first educational-support application for the Democratic Republic
of the Congo.

The client describes a learning need. Mon Précepteur takes care of everything else: analysing the
need, selecting a suitable tutor, presenting a service proposal, preparing the contract and the
invoice, collecting the payment through Mobile Money, verifying it, and assigning the tutor.

**This is not a public tutor marketplace.** Clients never browse, compare or select tutors. The
managed workflow is: *request → analysis → proposal → client decision → contract → invoice →
payment declaration → manual verification → receipt → tutor assignment → service.*

Three roles exist:

- **Parent / guardian** — registers children, describes their needs, follows the workflow.
- **Adult learner** — the same workflow, without child registration.
- **Administrator** — reviews requests, prepares proposals, contracts and invoices, verifies
  payments, assigns tutors. **Simulated locally in this prototype.**

The current phase is a **local-only prototype**: no backend, no real authentication, no Mobile
Money integration, no SMS/WhatsApp delivery, no legally reliable e-signature.

---

## 2. Mandatory Reading Order

Before implementing anything, read — in this order:

1. **`AGENTS.md`** (this file).
2. **The six context files** in `context/`:
   1. `context/project-overview.md` — the product, the users, the MVP scope.
   2. `context/architecture.md` — the technical architecture and the conceptual data model.
   3. `context/business-rules.md` — the states, the transitions and the validation rules.
   4. `context/ui-context.md` — the design tokens and the component library.
   5. `context/code-standards.md` — the coding rules.
   6. `context/ai-workflow-rules.md` — the workflow rules for agents.
3. **`context/step-features.md`** — the roadmap; read the section of the **approved step** and its
   prerequisites.
4. **`design.md`** — required whenever the step touches a screen, a component, a navigation
   destination or any copy.
5. **The existing code** — every file to be modified, plus its neighbours and its importers.

> "If the agent has not read these, its output will be rejected."

Additional documents that are not part of the core six but are required when relevant:
`context/test-plan.md` (before writing tests) and `context/risk-register.md` (before making or
changing a decision).

---

## 3. Context File Map

| File | Purpose |
|---|---|
| `AGENTS.md` | These rules. The entry point for every agent. |
| `CLAUDE.md` | An alias for this file (`@AGENTS.md`), for tooling that expects it. |
| `design.md` | **The authoritative UI/UX specification.** Every screen, its states, its copy in EN and FR. |
| `context/project-overview.md` | Product vision, users, business model, MVP scope, success criteria, the rule summary. |
| `context/architecture.md` | Stack, dependency versions, layering, navigation, state, persistence, the conceptual data model, error handling, the backend migration path. |
| `context/business-rules.md` | The authoritative states, transitions, guards and validation rules. |
| `context/ui-context.md` | Design tokens (colour, spacing, radii, type), the component library, the interaction patterns, accessibility, localisation. |
| `context/code-standards.md` | TypeScript, naming, component organisation, forms, state, errors, imports, testing, dependencies, accessibility, DRY. |
| `context/ai-workflow-rules.md` | The mandatory workflow for agents: reading order, scope control, verification, reporting, prohibitions. |
| `context/step-features.md` | **The ordered implementation roadmap.** The only source of work items. |
| `context/test-plan.md` | The automated and manual test scenarios. |
| `context/risk-register.md` | The unresolved decisions, assumptions and risks, with the open questions for the maintainer. |
| `context/progress-tracker.md` | The current phase, the completed steps, the next step, the known limitations. |

---

## 4. The Role of `design.md`

`design.md` is the **single source of truth for UI and UX decisions**: the screens, their purpose,
their fields, their states (loading, empty, error, success), their navigation, their required
components, their accessibility requirements and their copy in **both English and French**.

- If you build a screen, `design.md` already specifies it — follow it.
- If `design.md` does not specify something you need, **do not invent it**: ask, or record the
  assumption in `context/risk-register.md` and update `design.md`.
- If the code and `design.md` disagree, **the code is wrong** and is corrected.
- If `design.md` and `context/business-rules.md` disagree about a **rule or a status**, the rule
  document wins, and `design.md` is corrected.

`context/ui-context.md` holds the tokens and the component rules; `design.md` holds the screens.

---

## 5. The Role of `step-features.md`

`context/step-features.md` is the **ordered roadmap** and the **only source of work items**. Each
step has an ID (`S01`–`S25`), an objective, a scope, prerequisites, tasks, expected files, data and
state requirements, acceptance criteria, tests, a definition of done and its dependencies.

- Implement **one step at a time**, and only the step that is currently approved.
- Tick a step `- [x]` in `step-features.md` **and** update `context/progress-tracker.md` when it is
  complete.
- If a step proves larger than described, **stop and report it** rather than expanding the scope.
- Adding a step, reordering steps or splitting a step is a decision for the maintainer.

---

## 6. Business Rules (the non-negotiable core)

The full specification is `context/business-rules.md`. These are the ones an agent must never
violate:

- **BR-01 / BR-02** — The phone number is the primary client identifier. A client may have many
  requests over time; a request belongs to exactly one client.
- **BR-03** — A parent request has children; an adult request has none and the client is the
  learner. Never both.
- **BR-04 / BR-05** — A child belongs to the client profile and is reusable across requests. A
  learning need belongs to one request.
- **BR-06 / BR-07** — A proposal may cover one or more needs. **Tutor assignment is per need**, so
  several tutors for one child and one tutor for several needs are both supported.
- **BR-08** — "The same tutor if possible" is a preference, never a guarantee.
- **BR-09** — A PIN is **never stored in plain text**. The prototype stores a salted SHA-256 hash
  and is explicitly not production authentication.
- **BR-10 / BR-11 / BR-12** — A declared payment is *pending verification* until an administrator
  confirms it. A receipt exists only for a confirmed payment. A duplicate transaction ID is
  flagged, never silently accepted.
- **BR-13** — The payer's phone number may differ from the client's.
- **BR-14** — Request, proposal, contract, invoice, payment and assignment statuses are **six
  separate fields** with six separate state machines. Never one overloaded status.
- **BR-15** — Every administrative transition writes an activity event with an actor.
- **BR-16** — A rejected proposal does not close the request.
- **BR-17** — For a minor, the parties are Parent/Guardian ↔ Mon Précepteur. The tutor's own
  agreement is a separate document.
- **BR-20** — Contract wording is a placeholder pending validation by a qualified professional in
  the DRC.

---

## 7. Coding Standards (summary)

The full rules are `context/code-standards.md`. In short:

- **TypeScript strict.** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
  `tsc --noEmit` must be clean.
- **No `any`.** No `@ts-ignore`. No empty `catch`. Use `unknown` + a type guard.
- **String-literal unions, not `enum`.**
- **Named exports** (except route files, which default-export).
- **One rule in one place** — no duplicated business logic, validation, status labels or constants.
- **Services are pure** and hold the business rules; stores persist; screens compose.
- **Every user-facing string comes from the i18n dictionaries.** Add a key to `en.ts` **and**
  `fr.ts` in the same commit.
- **Every status change goes through the transition service**, with its guard and its activity
  event.
- **No new dependency without a documented justification.**
- **Accessibility**: labels, roles, 44 dp targets, no colour-only meaning.

---

## 8. Testing Requirements

Before reporting a step as complete, all of these must pass:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # jest
```

Additionally, for a step that touches the UI: run the app and manually exercise the acceptance
criteria, including one small-screen size (360×640 dp) and at least one empty and one error state.

The scenarios are specified in `context/test-plan.md`. Every transition in
`context/business-rules.md` needs a positive test and, where invalid transitions exist, a negative
one.

---

## 9. Planning and Approval Gates

1. **Planning is complete; implementation has not started.** The approval gate is explicit: no
   application code may be written until the maintainer approves the start of implementation.
2. **Only the approved step is implemented** (`context/progress-tracker.md` → *Current step*).
3. **A decision that materially affects architecture or business behaviour** — a data-model change,
   a new status, a changed rule, a new dependency, a change to the visual system — requires the
   maintainer's approval. Ask, or record the assumption in `context/risk-register.md` and flag it in
   the report.
4. **A new step, a reordering or a scope change** requires the maintainer's approval.
5. **The open questions in `context/risk-register.md` §3** are awaiting answers. Where the register
   already proposes a default, use it and report that you did.

---

## 10. Prohibited Behaviour

- ❌ Implementing anything before implementation is explicitly approved.
- ❌ Implementing more than the approved step, or several steps in one pass.
- ❌ Inventing requirements silently. Document the assumption instead.
- ❌ Adding `any`, `@ts-ignore`, or an `eslint-disable` to silence a type error.
- ❌ Adding a dependency without a documented justification.
- ❌ Hardcoding a user-facing string, a colour hex value, or a business constant.
- ❌ Duplicating a business rule, a validation rule or a status label.
- ❌ Mutating a store directly from a component, or bypassing a transition service.
- ❌ Creating a receipt for a payment that is not confirmed.
- ❌ Presenting a simulated action (PIN, signature, payment verification, notification delivery,
  admin mode) as a real one.
- ❌ Inventing legally binding contract wording.
- ❌ Implementing a real Mobile Money integration, a real SMS/WhatsApp sender or a real e-signature
  service, or claiming one exists.
- ❌ Overwriting an existing context file without reading it first.
- ❌ Committing, pushing or opening a pull request without an explicit instruction.

---

## 11. Documentation Update Requirements

| Change | Must update |
|---|---|
| A new screen or a changed screen | `design.md` |
| A new status, transition or guard | `context/business-rules.md` |
| A new entity or field | `context/architecture.md` §7 |
| A new dependency | `context/architecture.md` §1.2 **and** `context/step-features.md` |
| A new or changed i18n key | `en.ts` **and** `fr.ts`, in the same commit |
| A changed decision or a new assumption | `context/risk-register.md` |
| A completed step | `context/step-features.md` (checkbox) **and** `context/progress-tracker.md` |
| A new component | `context/ui-context.md` §5, if it is a design-system component |

Documentation is updated **in the same change as the code**, never in a later commit.

---

## 12. Nested Instruction Files and Precedence

- The **root `AGENTS.md`** governs the entire repository.
- If a nested `AGENTS.md` is ever added inside a directory (for example `app/AGENTS.md` or
  `src/features/AGENTS.md`), it **extends** the root rules for that directory only.
- **Precedence:** a nested file wins on the specific points it addresses; the root file wins on
  everything it already covers; `context/business-rules.md` wins over both on any business rule;
  `design.md` wins over both on any screen-level UI/UX decision.
- Nested instruction files do not exist yet. If you create one, document its scope and precedence
  here.

---

## 13. Communication

When you finish a step, report exactly:

1. **Changed files** — a list with a one-line purpose for each.
2. **Checks performed** — the commands run and their results, plus the manual checks.
3. **Known limitations** — anything incomplete, stubbed or deliberately out of scope.
4. **Assumptions made** — anything not explicitly specified, and how it was resolved.
5. **Documentation updated** — which files.
6. **Next step** — what the following step needs.

Never report a step as complete if `typecheck`, `lint` or `test` fails. Never hide a failure.
