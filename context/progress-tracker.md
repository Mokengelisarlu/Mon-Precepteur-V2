# Progress Tracker — Mon Précepteur V2

> Context file (extension of the six-file core system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/code-standards.md`,
> `context/ai-workflow-rules.md`, `context/step-features.md`, `context/risk-register.md`.

## Current phase
Foundation (Phase 1). Next approved step: **S03 — Localization infrastructure**.

## Completed steps
| Step | Date | Notes |
|---|---|---|
| S01 | 2026-10-21 | Repo initialised (`git init -b main`), toolchain configured for Expo SDK 57 with S01 deviations recorded in `context/architecture.md` §1.4 / `context/risk-register.md` R-23/R-24, placeholder app + smoke test passing, `expo-doctor` 21/21. First commit pending explicit user instruction. |
| S02 | 2026-10-22 | Design tokens in `src/lib/theme/tokens.json` (palette incl. approved status colours, spacing, radii, typography, elevation, motion) consumed by `tailwind.config.js`; 27 components + `ErrorBoundary` built and tested. `DateField`, `Attachment` and `ToastHost` deferred (R-25). |

## In progress
None.

## Next step
**S03 — Localization infrastructure** (prerequisite: S01; can run alongside S04). Every component
built in S02 takes its user-facing strings as props, so S03 can wire the dictionaries without
touching the component APIs. S03 must also add `expo-localization` (a new dependency — document it
in `context/architecture.md` §1.2 per the rules).

## Verification status
| Check | Result | Notes |
|---|---|---|
| `npm run typecheck` | Pass | `tsc --noEmit` clean (S02 component library included). |
| `npm run lint` | Pass | `eslint .` clean. |
| `npm test` | Pass | 54 tests / 6 suites: theme tokens, App smoke test, form controls, display, feedback, `ErrorBoundary`. |
| `npx expo-doctor` | Pass | 21/21 checks passed (last run at S01; no dependency changed in S02). |
| `npx expo export` (android) | Pass | Built successfully in S02 with a temporary route importing the whole `src/components/ui` barrel (removed afterwards) — proves Metro resolves every component, `tokens.json`, Lucide and the bottom sheet. |
| `npx expo export` (web) | Pass | Built in S02; CSS confirms `bg-surface` `#FFF8F4`, `bg-primary` `#9A4D00`, `bg-success-container` `rgb(205 239 214)`, `rounded-card` `12px`, `shadow-elevation-1/3` present. |

## Known limitations
- **No Git commits yet** — S01 DoD requires a first commit, but the repo rules prohibit committing/pushing/PRs without explicit instruction. Only `.gitignore` and initial files exist.
- **SDK 57 schema changes** — `newArchEnabled` removed, splash moved to `expo-splash-screen` plugin (R-24). Documentation updated.
- **Toolchain pinned below target baseline** — `react-native` `0.86.3` (from `0.86.2`), `jest` `~29.7.0` (from `^30.5.2`), `@types/jest` `29.5.14`. Added `babel-preset-expo`, `@typescript-eslint/*`, `expo-constants`, `react-native-web`, `@expo/metro-runtime`. Overrides: `react-dom: 19.2.3`, `expo-font: ~57.0.4`. See `context/architecture.md` §1.4, `context/risk-register.md` R-23.
- **`DateField` and `Attachment` are deferred** — they need `@react-native-community/datetimepicker` and `expo-image-picker` respectively; the latter is planned for S19 (R-16). The rest of ui-context §5 is implemented (R-25).
- **`ToastHost` is deferred to S04** — S02 ships the presentational `Toast`; the provider that queues and stacks toasts arrives with the app shell (R-25).
- **`Skeleton` has no shimmer** — it is static by design so it never disturbs tests or reduced-motion users.
- **Admin French-only (prototype)** — R-15.
- **No authentication/authorisation** — R-17; admin simulation is unauthenticated by design.
- **Currency USD only** — R-19, pending confirmation.
- **Local-only, no backend** — R-18 deferred.

## Blockers
None for S03.
