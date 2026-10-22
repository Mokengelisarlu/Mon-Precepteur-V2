# AI Workflow Rules — Mon Précepteur V2

> Context file 5 of 6 (core context system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/code-standards.md`,
> `context/progress-tracker.md`.
> Roadmap: `context/step-features.md`. UI/UX source of truth: `design.md`.

These rules are **mandatory for every agent and subagent** working on this repository. An agent that
skips the reading order produces output that must be rejected.

---

## 1. Mandatory Reading Order

Before writing or changing a single line of code:

1. **`AGENTS.md`** (repository root) — the project rules.
2. **The six context files** in `context/`:
   `project-overview.md` → `architecture.md` → `business-rules.md` → `ui-context.md` →
   `code-standards.md` → `ai-workflow-rules.md`.
3. **`context/step-features.md`** — specifically the section of the **approved step** you are about
   to implement, plus its prerequisites.
4. **`design.md`** — if the step touches any screen, component, navigation or copy.
5. **The existing code** — every file you are about to modify, and the files that import it.

> "If the agent has not read these, its output will be rejected."

A subagent that only performs research inherits the requirement to report what it found; it must
not write code it has not read the context for.

---

## 2. Scope Control

### 2.1 Implement only the approved step

- The roadmap in `context/step-features.md` is the **only** source of work items.
- Implement **one step at a time**. Do not start step N+1 while step N is in progress.
- Do not implement features that are not in the current step, even if they seem obvious or tiny.
- Do not "improve" screens that are outside the current step.

### 2.2 Keep changes small and testable

- A step must be implementable, reviewable and verifiable **in isolation**.
- Prefer many small commits over one large one.
- If a step turns out to be larger than its description, **stop and report it** rather than
  silently expanding the scope. Splitting a step is a decision for the maintainer.

### 2.3 Do not invent missing requirements

- If a requirement is missing, ambiguous or contradictory between documents, **do not guess**.
- Either:
  - ask a question (if the session supports it), **or**
  - implement the least invasive interpretation and **record the assumption** in
    `context/risk-register.md` and in the step report.
- Never silently promote an assumption into a confirmed product requirement.

### 2.4 Ask when a decision materially affects architecture or business behaviour

Ask (or flag for approval) when a decision would:

- change the conceptual data model or a relationship between entities,
- add or remove a status / state transition,
- change a business rule listed in `context/business-rules.md`,
- add or upgrade a dependency,
- change the visual system in `context/ui-context.md`,
- contradict something written in `design.md`,
- expand the MVP scope in `context/project-overview.md` §6.

**Do not ask about** cosmetic choices already covered by the context files, or implementation
details that `context/code-standards.md` already settles.

---

## 3. Implementation Rules

1. **Inspect before editing.** Read the target file and its neighbours. Match the existing style,
   naming, and structure. Never replace a working pattern with a different one for personal
   preference.
2. **Follow the layering rules** in `context/architecture.md` §11.1. A circular import between two
   features is a defect.
3. **Never use `any`.** Use `unknown` and a type guard, or a proper generic. See
   `context/code-standards.md` §1.2.
4. **No dependency without a documented justification.** See `context/code-standards.md` §8.
5. **One rule, one place.** Never duplicate a business rule, a validation rule, a status label, a
   constant or a derivation. See `context/code-standards.md` §5.4.
6. **Every user-facing string comes from the i18n dictionaries.** No hardcoded strings in
   components. A new key is added to **both** `en.ts` and `fr.ts` in the same commit.
7. **Every status change goes through the transition service**, with the guard enforced and an
   `ActivityEvent` written.
8. **Never write an `ActivityEvent` without an actor** (`client` | `admin` | `system`).
9. **Never create a receipt for a payment that is not `confirmed`.**
10. **Never mark a payment as confirmed outside the verification service.** The client declares;
    the administrator verifies.
11. **Label every simulation.** Anything simulated in the prototype must be visibly labelled as
    such in the UI (PIN, signature, payment verification, admin mode, notifications).
12. **Do not hardcode** colour hex values in components — use the tokens in `tailwind.config.js`
    (`context/ui-context.md` §3).
13. **Do not hardcode** numbers that represent business options (session durations, operators,
    frequencies) — use the exported constants.

---

## 4. Verification Process

Run these before reporting a step as complete:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # jest
```

All three must pass. If a command cannot run because the step has not yet scaffolded it, say so
explicitly in the report rather than claiming it passed.

**Additionally, for a step that touches the UI:** open the app (`npx expo start`) and manually
exercise the step's acceptance criteria, including at least one small-screen size (360×640 dp) and
one error/empty state.

### 4.1 Code Quality Checklist

- [ ] `tsc --noEmit` is clean
- [ ] ESLint is clean, with no new warnings
- [ ] The new tests pass, and the existing suite still passes
- [ ] No `any`, no `@ts-ignore`, no empty `catch`
- [ ] No hardcoded user-facing string
- [ ] Both `en.ts` and `fr.ts` updated if a key was added
- [ ] No new dependency, or a documented justification
- [ ] Business rules go through the transition service
- [ ] Accessibility: labels, roles, and 44 dp targets
- [ ] The changed files are listed in the report

---

## 5. Documentation Updates

| Situation | File to update |
|---|---|
| A decision changed | `context/risk-register.md` (and the decision row in `context/architecture.md` §14 if it is an architecture decision) |
| A new status, transition or guard | `context/business-rules.md` |
| A new entity or field | `context/architecture.md` §7 |
| A new screen or a changed screen | `design.md` |
| A new dependency | `context/architecture.md` §1.2 **and** `context/step-features.md` |
| A step completed | `context/progress-tracker.md` **and** the checkbox in `context/step-features.md` |
| A new assumption made | `context/risk-register.md` |

Documentation is updated **in the same change** as the code, never in a later commit.

---

## 6. Progress Tracking

- After a step is completed and verified, update **`context/progress-tracker.md`**: the current
  phase, the completed step, the next approved step, the test status, and any new limitation.
- Tick the step's checkbox in **`context/step-features.md`** (`- [x]`) and mark the in-progress
  step (`- [~]`).
- Legend: `[ ]` planned · `[~]` in progress · `[x]` done · `[-]` cancelled.

---

## 7. Required Report Format

Every agent's final report on a step must contain exactly these sections:

1. **Changed files** — a list, with a one-line purpose for each.
2. **Checks performed** — the commands run and their result (pass/fail), plus any manual checks.
3. **Known limitations** — anything incomplete, stubbed, or deliberately out of scope for this
   step.
4. **Assumptions made** — any requirement that was not explicitly specified and how it was
   resolved (must also appear in the risk register).
5. **Documentation updated** — which context files were changed.
6. **Next step** — what the following step will require.

Never report a step as complete if `typecheck`, `lint` or `test` fails, and never hide a failure
behind a summary.

---

## 8. Forbidden

- ❌ Implementing anything before the corresponding roadmap step is approved.
- ❌ Implementing several roadmap steps in one pass.
- ❌ Changing the conceptual data model without updating `context/architecture.md` **and**
  `context/business-rules.md` in the same change.
- ❌ Inventing legal contract wording as if it were reviewed by a lawyer. The contract text is a
  placeholder and must be labelled as such.
- ❌ Presenting a simulated action (PIN, signature, payment verification, notification delivery) as a
  real one.
- ❌ Implementing a real Mobile Money integration, a real SMS/WhatsApp sender, or a real e-signature
  service — there is no such provider, and claiming otherwise is a functional lie.
- ❌ Adding `any`, `@ts-ignore`, or `eslint-disable` to silence a type error.
- ❌ Adding a dependency without justification.
- ❌ Deleting or overwriting an existing context file without reading it first.
- ❌ Committing, pushing, or opening a pull request without an explicit instruction.
- ❌ Modifying `AGENTS.md`, `design.md` or the context files to make a failing implementation look
  compliant.

---

## 9. Working with Subagents

When delegating, the parent agent must include in the prompt:

- the reading order from §1 and the list of files to read,
- the **exact step ID and its acceptance criteria** from `context/step-features.md`,
- the relevant rules from `context/code-standards.md`,
- the scope boundaries ("do not touch X"),
- the required output format from §7.

A subagent's result is trusted **only if** it reports the files it read. If it cannot state which
context files it consulted, its output must be treated as unverified and re-checked.

---

## 10. When the Documentation and the Code Disagree

The **documentation wins** — the code is corrected. If the documentation itself is wrong or
outdated, the documentation is corrected **first**, in its own explicit change, with the reason
recorded in `context/risk-register.md`. The code is then brought into line. Documentation and code
are never changed in a way that leaves them disagreeing.
