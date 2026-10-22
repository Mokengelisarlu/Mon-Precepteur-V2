# Progress Tracker — Mon Précepteur V2

> Context file (extension of the six-file core system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/ui-context.md`, `context/code-standards.md`,
> `context/ai-workflow-rules.md`, `context/step-features.md`, `context/risk-register.md`.

## Current phase
Phase 2 — The client request journey. Last completed step: **S05 — Welcome screen**. Next approved
step: **S06 — Request-type selection**.

## Completed steps
| Step | Date | Notes |
|---|---|---|
| S01 | 2026-10-21 | Repo initialised (`git init -b main`), toolchain configured for Expo SDK 57 with S01 deviations recorded in `context/architecture.md` §1.4 / `context/risk-register.md` R-23/R-24, placeholder app + smoke test passing, `expo-doctor` 21/21. First commit pending explicit user instruction. |
| S02 | 2026-10-22 | Design tokens (`src/lib/theme/tokens.json` + Tailwind) and the 27-component UI library (`src/components/ui/**`) + `ErrorBoundary`; `DateField`, `Attachment` deferred, `ToastHost` deferred to S04 (R-25). |
| S03 | 2026-10-22 | `expo-localization` added with EN/FR plugin config; `src/lib/i18n/` (`en.ts`, `fr.ts` typed as `Record<TranslationKey,string>`, `translate` with `{param}` interpolation and `_one/_other`, `locale` detection/defaulting to FR with override; `src/hooks/use-translation.ts`, `src/store/session-store.ts`); `src/lib/format/` (`formatAmount` USD EN code / FR symbol, `formatDate`/`formatDateTime`, `formatRelativeTime` with `common.now` fallback). `t()` is the only translation entry point. |
| S04 | 2026-10-22 | Navigation shell: root layout (`GestureHandlerRootView` → `SafeAreaProvider` → `ErrorBoundary` → `ToastHost` → `Stack`, splash handling, `StatusBar`), client stack `app/(client)/**` (18 routes), admin stack `app/admin/**` (9 routes, a URL **segment** — R-26), `+not-found`, `src/lib/navigation/routes.ts` + `params.ts` (typed builders, entity-id validation), `src/hooks/use-not-found-state.ts` + `use-route-param.ts`, `NotFound` / `RoutePlaceholder` / `ToastHost` components, the admin simulation entry on Welcome, translated header titles (`nav.*`). 108 tests pass. |
| S05 | 2026-10-22 | Welcome screen: `app/(client)/welcome.tsx` (thin composition) → `src/features/request/screens/welcome-screen.tsx` with `welcome-hero.tsx` (the `assets/mon-precepteur-logo.png` lock-up — R-14 closed), `welcome-reassurance-list.tsx` and `welcome-continue-sheet.tsx`; the `welcome.*` copy in both dictionaries; `expo-env.d.ts` for the `*.png` import. The draft-dependent parts (`hasDraft`, `restorationState`) are props until S13/S14 (R-29). Device crash on language switch fixed (R-30: the `SegmentedControl` and the `Card` always resolve a shadow class). 120 tests pass. |

## In progress
None.

## Next step
**S06 — Request-type selection** (prerequisites: S05 — complete). Implement the request-type sheet:
the route `app/(client)/request-type.tsx` → `src/features/request/screens/request-type-screen.tsx`
with `src/features/request/components/request-type-options.tsx`, two large options ("For my child" /
"For myself") with an icon, a title and a one-line explanation, routing to the child list
(`/children`) or the adult needs form (`/needs/self`). The choice is stored in the request draft
store (`journeyType`), which starts with the S05 seams in place.

## Verification status
| Check | Result | Notes |
|---|---|---|
| `npm run typecheck` | Pass | `tsc --noEmit` clean (S05 welcome screen, its three components and the `*.png` module declaration included). |
| `npm run lint` | Pass | `eslint .` clean. The `import/no-unresolved` rule now ignores `.png` (the bundler resolves the asset, not Node). |
| `npm test` | Pass | 120 tests / 15 suites: theme tokens, i18n dictionaries/translate/locale, formatters, useTranslation/session store, form controls, display (Card shadow invariant), feedback (SegmentedControl shadow invariant), ErrorBoundary, ToastHost, root layout, navigation shell (10 cases), route tree (27 routes), welcome screen (10 cases). |
| `npx expo-doctor` | Advisory | Two findings, both pre-existing from S01 and untouched in S05: the missing `react-dom` peer of `react-native-web`, and two patch drifts (`expo` 57.0.30 vs ~57.0.31, `expo-router` 57.0.28 vs ~57.0.29). No blocking compatibility error. |
| `npx expo export` (android) | Pass | Built with the complete route tree and the Welcome screen — proves Metro resolves every route file, the image asset and the new components. |
| Device check (Android emulator, Expo Go) — S04 shell | Pass | Opened on the emulator: `/` redirects to `/welcome`; the admin entry opens `/admin` (header "Admin dashboard") and the system back returns to `/welcome`; `/unknown-route` and `/proposal/not-an-id` render the not-found state ("Not found" / "We could not find this information." / "Back home" or "Back to the dashboard"); the dashboard action lands on `/dashboard` (header "Dashboard"). Checked again at **360×640 dp** (`wm size 720x1280`, `wm density 320`): no clipped text, the primary action stays reachable. |
| Device check (Android emulator, Expo Go) — S05 Welcome | Pass | The brand lock-up renders at 120×106 dp, the CTA "Get Started" is the dominant action, the three reassurance points, the language switch and the "Administration (simulation)" entry are present. **Language switch**: EN → FR → EN changes every visible label immediately with **no crash and no JS error** after the R-30 fix (before the fix, the first switch crashed the app in development). Checked at 1080×2280 @ 440 **and at 360×640 dp** (`wm size 720x1280`, `wm density 320`): the CTA stays above the fold (24→336 dp wide, 331→387 dp high), no clipped text, the switch remains reachable. |

## Known limitations
- **No Git commits yet** — S01 DoD requires a first commit, but the repo rules prohibit committing/pushing/PRs without explicit instruction.
- **SDK 57 schema changes** — `newArchEnabled` removed, splash moved to `expo-splash-screen` plugin (R-24). Documentation updated.
- **Toolchain pinned below target baseline** — `react-native` `0.86.3` (from `0.86.2`), `jest` `~29.7.0` (from `^30.5.2`), `@types/jest` `29.5.14`. Added `babel-preset-expo`, `@typescript-eslint/*`, `expo-constants`, `react-native-web`, `@expo/metro-runtime`. Overrides: `react-dom: 19.2.3`, `expo-font: ~57.0.4`. See `context/architecture.md` §1.4, `context/risk-register.md` R-23.
- **`DateField` and `Attachment` are deferred** — they need `@react-native-community/datetimepicker` and `expo-image-picker` respectively; the latter is planned for S19 (R-16). The rest of ui-context §5 is implemented (R-25).
- **`Skeleton` has no shimmer** — it is static by design so it never disturbs tests or reduced-motion users.
- **Only the Welcome screen is real** — every other route file still renders its own path through `RoutePlaceholder` until the screen is built (R-28). The placeholders print technical paths and are not localised copy.
- **The Welcome draft seams are props** — "Continue your request" and the restoring spinner cannot appear until S13/S14 supply the store and the persistence layer (R-29).
- **A NativeWind development crash was worked around, not fixed upstream** — a `className` that adds a shadow utility at runtime crashes the app in development; the `SegmentedControl` and the `Card` always resolve a shadow class instead, and the rule is in `context/ui-context.md` §5.1 (R-30). Production builds are unaffected, but the same trap applies to any future component that toggles a shadow at runtime.
- **The admin tree is a URL segment, not an `(admin)` group** — required to produce the `/admin/...` URLs of architecture §3.2 without shadowing the client routes (R-26, Q13 — awaiting confirmation).
- **A stale URL parameter after a replace** — the param of the route being left is kept by React Navigation, so the not-found action on `/proposal/not-an-id` lands on `/dashboard?proposalId=not-an-id`. Cosmetic (R-27).
- **The header titles are derived** — the `nav.*` keys come from the screen names of `design.md`; `design.md` §2.1 now records them (R-28).
- **Admin French-only (prototype)** — R-15.
- **No authentication/authorisation** — R-17; admin simulation is unauthenticated by design.
- **Currency USD only** — R-19, pending confirmation.
- **Local-only, no backend** — R-18 deferred.

## Blockers
None for S06.
