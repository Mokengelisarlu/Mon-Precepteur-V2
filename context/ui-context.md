# UI Context — Mon Précepteur V2

> Context file 3 of 6 (core context system).
> Companion documents: `context/project-overview.md`, `context/architecture.md`,
> `context/business-rules.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`,
> `context/progress-tracker.md`.
> **Authoritative design document: `design.md` (repository root).** This file summarises the visual
> system and its rules; where the two differ, `design.md` wins for screen-level detail and this file
> wins for tokens and component rules.

---

## 1. Provenance of the Visual System — Read This First

Mon Précepteur V2 has **no code of its own yet**, so there is no in-repo visual history to inherit.
The visual direction below is **not invented**: it is **carried over from the existing Mon
Précepteur V1 prototype** at `/home/anaclet/workspace/Dev/m3e-test`, which is the same product and
already ships a Material-3 palette and assets.

| Token group | Provenance | Status |
|---|---|---|
| Colour palette, spacing scale, radii, font family | V1 `src/theme/{colors,spacing,shapes,theme}.ts` | **Carried over unchanged** (hex values identical) |
| App name, slug, icon, splash, adaptive icon | V1 `app.json` + `assets/` | **Carried over unchanged** |
| Semantic status colours (success / warning / info) | **New in V2** — the MD3 palette has no such roles | **Proposed, needs approval** (see §3.3 and risk `R-13`) |
| Component library | V1 used `react-native-paper`; V2 uses NativeWind | **Rewritten** — the V1 components are not portable |
| Typography scale | MD3 default scale from `react-native-paper` | **Re-derived** as Tailwind tokens in V2 |

**Unresolved / not established by evidence** — recorded rather than invented:

- The **logo mark** itself. V1's `src/components/Logo.tsx` is an SVG placeholder explicitly marked
  "replace with the real logo". **Resolved in S05:** the brand owner supplied
  `assets/mon-precepteur-logo.png`, used as the Welcome lock-up above the wordmark. The app icon,
  splash and adaptive-icon assets are unchanged.
- **Dark mode.** V1 ships `userInterfaceStyle: "light"` only. V2 stays light-only in the
  prototype; the token structure must nevertheless allow a future dark palette. **Decided:
  light-only.**
- **Motion personality.** No motion tokens existed in V1. V2 defines a restrained default
  (150–250 ms, easing curves) in §6 — this is a **new decision**, not inherited.

---

## 2. Visual Direction

**Warm, calm, trustworthy, unhurried.** The palette is a warm brown-orange Material 3 scheme on a
warm off-white surface. It reads as friendly and educational rather than corporate or clinical —
appropriate for parents and adult learners, and distinct from the blue/grey of typical fintech or
government apps.

- **Tone of voice (FR):** courteous, reassuring, plain language. Short sentences. The second person
  ("vous") for client-facing copy. Never condescending, never bureaucratic.
- **Tone of voice (EN):** the same register — warm, direct, plain.
- **Visual density:** low. One idea per card, generous spacing, at most one primary button per
  screen.

---

## 3. Design Tokens

### 3.1 Brand palette (carried over from V1 — exact values)

```ts
export const palette = {
  primary: '#9A4D00',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FFDCC2',
  onPrimaryContainer: '#321300',
  secondary: '#765B43',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F5DEC9',
  onSecondaryContainer: '#29180A',
  tertiary: '#6A5D00',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F1E6A8',
  onTertiaryContainer: '#211B00',
  surface: '#FFF8F4',
  surfaceContainerLow: '#FCF0E8',
  surfaceContainer: '#F7EAE1',
  surfaceContainerHigh: '#F1E3DA',
  surfaceContainerHighest: '#EBDDD4',
  onSurface: '#211A15',
  onSurfaceVariant: '#51443B',
  outline: '#83736A',
  outlineVariant: '#D6C2B5',
  inverseSurface: '#362F28',
  inverseOnSurface: '#FBEEE5',
  inversePrimary: '#FFB77C',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
} as const;

export const brandSeed = '#F68C1F';
```

### 3.2 Tailwind mapping (`tailwind.config.js`)

NativeWind uses Tailwind's default utility names, so the MD3 role names are exposed as semantic
Tailwind colours:

| Tailwind token | Value | MD3 role |
|---|---|---|
| `primary` | `#9A4D00` | primary |
| `on-primary` | `#FFFFFF` | onPrimary |
| `primary-container` | `#FFDCC2` | primaryContainer |
| `on-primary-container` | `#321300` | onPrimaryContainer |
| `secondary` | `#765B43` | secondary |
| `on-secondary` | `#FFFFFF` | onSecondary |
| `secondary-container` | `#F5DEC9` | secondaryContainer |
| `on-secondary-container` | `#29180A` | onSecondaryContainer |
| `tertiary` | `#6A5D00` | tertiary |
| `on-tertiary` | `#FFFFFF` | onTertiary |
| `tertiary-container` | `#F1E6A8` | tertiaryContainer |
| `on-tertiary-container` | `#211B00` | onTertiaryContainer |
| `surface` | `#FFF8F4` | surface (also the app background) |
| `surface-low` | `#FCF0E8` | surfaceContainerLow |
| `surface-container` | `#F7EAE1` | surfaceContainer |
| `surface-high` | `#F1E3DA` | surfaceContainerHigh |
| `surface-highest` | `#EBDDD4` | surfaceContainerHighest |
| `on-surface` | `#211A15` | onSurface (primary text) |
| `on-surface-variant` | `#51443B` | onSurfaceVariant (secondary text) |
| `outline` | `#83736A` | outline (borders, icons) |
| `outline-variant` | `#D6C2B5` | outlineVariant (subtle dividers) |
| `inverse-surface` | `#362F28` | inverseSurface |
| `on-inverse-surface` | `#FBEEE5` | inverseOnSurface |
| `inverse-primary` | `#FFB77C` | inversePrimary |
| `error` | `#BA1A1A` | error |
| `on-error` | `#FFFFFF` | onError |
| `error-container` | `#FFDAD6` | errorContainer |
| `on-error-container` | `#410002` | onErrorContainer |

The MD3 elevation levels map onto the surface containers:
`level0 → transparent`, `level1/2 → surface-low`, `level3 → surface-container`,
`level4/5 → surface-high`.

### 3.2.1 Elevation and shadow tokens — approved in S02

Shadows are **derived from the palette**, never a neutral grey: the shadow colour is the
`outline-variant` role (`#D6C2B5`) at increasing opacity. Three levels are exposed through the
Tailwind `boxShadow` scale, and the matching `elevation` numbers let NativeWind translate the same
class into an Android `-rn-elevation` value. **Use the class `shadow-elevation-1/2/3`** — a plain
`elevation-*` class produces no style on iOS or web.

| Token | `boxShadow` | Used for |
|---|---|---|
| `elevation-1` | `0 1px 2px 0 rgba(214, 194, 181, 0.45)` | Cards at rest, selected segment |
| `elevation-2` | `0 2px 6px 0 rgba(214, 194, 181, 0.60)` | Raised card, pressed surface |
| `elevation-3` | `0 6px 16px 0 rgba(214, 194, 181, 0.80)` | Bottom sheet, dialog, toast |

### 3.2.2 Single source of truth — `src/lib/theme/tokens.json`

Since S02 the palette, spacing, radii, typography scale, elevation and motion durations live in
**`src/lib/theme/tokens.json`**. It is consumed by:

- `tailwind.config.js` → `colors`, `spacing`, `borderRadius`, `fontSize`, `boxShadow`, `elevation`;
- `src/lib/theme/index.ts` → typed access for the code that needs a raw colour value
  (`themeColor('outline')`, `radii.sheet`, `spacing.l`).

**No component may hardcode a colour, a spacing value or a radius.** They use the Tailwind classes
(`bg-primary`, `px-l`, `rounded-card`) or the typed helpers above. A new token is added in the JSON
file first, then consumed — never the other way round.

### 3.3 Semantic status colours — **APPROVED in S02 (R-13 resolved)**

The MD3 palette carries no success/warning/info roles, but the product displays request, proposal,
contract, invoice, payment and assignment statuses. The maintainer approved these values during
S02:

| Token | Value | Container | On-container | Used for |
|---|---|---|---|---|
| `success` | `#2E6B3F` | `#CDEFD6` | `#0C2011` | Confirmed payment, accepted proposal, active service |
| `warning` | `#8A5300` | `#FFDDBC` | `#2C1700` | Pending verification, awaiting payment, on hold |
| `info` | `#2F5D9C` | `#D6E3FF` | `#001A41` | Under review, proposal sent, in progress |

Each role also has an `on-*` token for text and icons placed on the solid role colour:
`on-success` `#FFFFFF`, `on-warning` `#FFFFFF`, `on-info` `#FFFFFF` (all pass WCAG AA on their
solid background).

Status colours are **never used as the only signal** — every status badge also carries a text label
(§8). This is both an accessibility requirement and a colour-blindness requirement.

### 3.4 Spacing scale (carried over from V1)

| Token | Value | Tailwind equivalent |
|---|---|---|
| `xs` | 4 | `p-1` |
| `s` | 8 | `p-2` |
| `md` | 12 | `p-3` |
| `l` | 16 | `p-4` (screen padding) |
| `xl` | 24 | `p-6` |
| `xxl` | 32 | `p-8` |

**Screen horizontal padding is always 16 (`l`)**. Vertical rhythm between cards is 16; between a
title and its content, 8–12.

### 3.5 Radii (carried over from V1)

| Token | Value | Use |
|---|---|---|
| `button` | 10 | Buttons, chips |
| `card` | 12 | Cards, list items |
| `dialog` | 12 | Dialogs, alerts |
| `field` | 16 | Inputs, selects |
| `image` | 20 | Avatars, images |
| `sheet` | 28 | Bottom sheet top corners |

### 3.6 Typography

- **Font family:** the platform default (Roboto on Android, San Francisco on iOS). V1 used
  `fontFamily: 'Roboto'`; V2 uses the **system stack** so it renders correctly on iOS too. **No
  custom font is added** (no `expo-font` dependency in the prototype).
- **Scale** (MD3-derived, carried over from V1):

| Role | Size / line height | Weight |
|---|---|---|
| Display small | 36 / 44 | 400 |
| Headline large | 32 / 40 | 400 |
| Headline medium | 28 / 36 | 400 |
| Headline small | 24 / 32 | 400 |
| Title large | 22 / 28 | 400 |
| Title medium | 16 / 24 | 500 |
| Title small | 14 / 20 | 500 |
| Body large | 16 / 24 | 400 |
| Body medium | 14 / 20 | 400 |
| Body small | 12 / 16 | 400 |
| Label large | 14 / 20 | 500 |
| Label medium | 12 / 16 | 500 |
| Label small | 11 / 16 | 500 |

### 3.7 Icons

`lucide-react-native` only, wrapped by `src/components/ui/Icon.tsx`. Default size 20, stroke width
2. Icons are **decorative by default** (`accessibilityElementsHidden` unless they carry meaning) —
the icon never replaces a text label for an action.

---

## 4. Mobile Layout Rules

1. **Portrait, 100%.** `orientation: "portrait"` in `app.json` (as V1).
2. **Screen padding:** 16 horizontal, safe-area aware at the top and bottom.
3. **Content width:** unconstrained on phones; on tablets/landscape the content is centred with a
   maximum readable width of 640.
4. **Scroll:** every screen that can overflow scrolls vertically with a bottom padding of at least
   32 so the last element is never trapped under the home indicator.
5. **The primary action is pinned** at the bottom of the screen (a footer bar above the safe area)
   on form screens and detail screens that have one primary action.
6. **The header** shows a back button (except on Welcome), a centred title, and no more than one
   secondary action (usually an overflow menu).
7. **No horizontal scrolling, ever.** Long content wraps.
8. **Tap targets** are at least 44×44 dp.
9. **The keyboard must never cover the focused field.** The primary footer action rises above the
   keyboard, or the field is scrolled into view.

---

## 5. Reusable Component Concepts

All live in `src/components/ui/` and are exported from a single `index.ts` barrel.
`src/components/feedback/ErrorBoundary.tsx` holds the screen-level error boundary.
`src/components/feedback/ToastHost.tsx` holds the toast provider (built in **S04**).
`src/components/feedback/NotFound.tsx` holds the "not found" state used by the unknown-route screen
and by any screen that receives an unknown id (built in **S04**). It is **presentational**: the
title, the description and the action label are passed in, so the copy comes from the dictionaries
and the action stays in the screen.
`src/components/feedback/RoutePlaceholder.tsx` holds the temporary placeholder rendered by the route
files until the real screen is built (**S04** scaffold — each route file renders its own path). It
is not part of the design system and disappears as the screens are delivered.

Every component is **controlled** (the caller owns the value) and **stateless** except for the
transient UI state they own (an open sheet, a draft selection, a toast timer). **No component
hardcodes a user-facing string**: labels, placeholders, helper texts and button texts are passed as
props, because the i18n dictionaries arrive in **S03**.

### 5.1 Runtime `className` changes — the shadow rule (R-30)

A component whose `className` changes with its state must **always resolve the same set of utility
families**. NativeWind compiles the shadow utilities into a CSS **variable**
(`--tw-shadow-color`); when such a class appears for the first time at runtime, NativeWind raises a
development-only "upgrade" warning that serialises the component props — and that serialisation
walks the React internals and crashes the app with `Couldn't find a navigation context`
(**R-30**).

The rule is therefore:

- A component with a state-dependent `className` **always carries a shadow class**:
  `shadow-elevation-1/2/3` when the elevation is on, `shadow-none` when it is off.
- `shadow-none` is transparent with an elevation of `0` — it is visually identical to no shadow.
- No other utility family is affected: `bg-*`, `text-*`, spacing, radius and typography are safe
  to toggle at runtime.

| Component | Purpose | Notes |
|---|---|---|
| `Button` | Primary / secondary / tertiary / destructive | Variants: `filled`, `tonal`, `outlined`, `text` (there is no separate `ghost` variant — `text` covers it). Sizes: `sm`, `md`, `lg`. The loading state shows a spinner, sets `busy` and disables the button. `fullWidth` for form footers. |
| `IconButton` | Icon-only action | Requires `accessibilityLabel`. Variants and sizes mirror `Button`. |
| `Input` | Text field | Label above, helper/error text below, optional leading/trailing icon, `secureTextEntry` support, character counter when `maxLength` is set. |
| `Select` | Select field | Opens a **bottom sheet** with a single-selection list (a check mark marks the selected option), not a platform picker. |
| `MultiSelect` | Multi-choice select | Opens the same bottom sheet as `Select` with a checkbox list; the selection is applied on confirmation. Used for the covered needs of a proposal and the billable needs of an invoice. |
| `TextArea` | Multi-line input | Grows with the content between `minHeight` and `maxHeight`; shows a character counter when `maxLength` is set. |
| `DateField` | Date field | **Deferred in S02** — requires `@react-native-community/datetimepicker`, which is not a dependency of the prototype. |
| `PinInput` | 4-digit code entry | Boxes, digits only, auto-completes, accessible as a single field. |
| `Checkbox` | Boolean field | A labelled native checkbox with a 44 dp touch target. Used for the administrator's pre-assignment checks. |
| `Attachment` | Optional file field | **Deferred in S02** — requires `expo-image-picker`, which is not a dependency of the prototype (R-16). |
| `Card` | Content container | `surface-container` background, 12 radius, optional header row, optional `onPress`. |
| `Surface` | Tinted container | Variants: `surface`, `low`, `container`, `high`, `highest`. Elevation: `none`, `elevation-1`, `elevation-2`, `elevation-3`. |
| `ListItem` | Row in a list | Title, description, optional leading icon, optional trailing icon, optional `onPress`. |
| `Badge` | Status pill | Colour + text label (never colour alone). Variants: neutral, primary, success, warning, error, info. |
| `Avatar` | Initials avatar | Derived from the first letters of the name; uses `primary-container`. |
| `Sheet` | Bottom sheet | Wraps `@gorhom/bottom-sheet`. Controlled by a `visible` prop, title, optional footer, keyboard-aware height, pan-down to close. |
| `Dialog` | Modal confirmation | React Native `Modal`; only for destructive or irreversible confirmations. |
| `EmptyState` | No-content placeholder | Icon, title, description, optional CTA. |
| `ErrorState` | Recoverable error | Icon, title, description, "Try again" action. |
| `Skeleton` | Loading placeholder | Matches the shape of the content it replaces. Static (no shimmer) so it never disturbs a test or a reduced-motion user. |
| `Toast` | Transient feedback | Success / error / info. Auto-dismiss 3 s. Never used for information the user must act on. The provider that stacks the toasts is `ToastHost` (built in **S04**). |
| `Alert` | Inline message block | A persistent, dismissible block inside a card: `info`, `warning`, `error`, `success`. Used for the simulation notices and the duplicate-transaction warning. Announced with `role="alert"` when it is an error. |
| `ProgressBar` | Progress indicator | Optional label and percentage; the value is exposed to the accessibility tree as a `progressbar`. |
| `Stepper` | Ordered step indicator | Used on the request flow header. |
| `Timeline` | Vertical event timeline | A vertical list of dated events with a marker per entry; the current phase is highlighted. Used for the client dashboard timeline and the administrator's activity history. |
| `Divider` | Horizontal rule | `outline-variant`. |
| `KeyValue` | Label/value row | Used for contract, invoice and receipt detail blocks. |
| `SegmentedControl` | 2–3 exclusive options | Used for the language switch and for format selection. |
| `Icon` | Lucide wrapper | Centralises `react-native-svg`. The colour is a palette token name, never a raw hex value. |

---

## 6. Interaction Patterns

### 6.1 Bottom sheets

- Used for **secondary choices and short forms**: request type, child form, need form, selects,
  confirmations, the "continue your request" prompt.
- A sheet never contains more than one screen of content; if it needs more, it becomes a route.
- Sheets are dismissible by swipe-down and by the back gesture.
- The sheet's title is always visible; the primary action is pinned at the bottom of the sheet.
- **The request-type selection is a sheet on the Welcome screen**, per the brief.

### 6.2 Forms

- One field group per card; the label is always visible above the field (no placeholder-only
  fields — placeholders disappear and break low-vision users).
- Validation runs on **blur** for a field and on **submit** for the whole form.
- The first errored field receives focus on a failed submit, and the form scrolls to it.
- Errors are shown as text under the field, never as colour alone, and are announced to the
  screen reader.
- The submit button shows a loading state while the form is submitting and is disabled meanwhile.

### 6.3 Feedback

| Situation | Mechanism |
|---|---|
| Success of a non-blocking action | Toast |
| Failure of a blocking action | Inline error under the field / a full `ErrorState` |
| Destructive or irreversible confirmation | Dialog with an explicit destructive button |
| Result of an administrative action | Toast + the updated list refreshes |
| Long operation (≥ 300 ms) | Skeleton or an inline activity indicator |

### 6.4 Status presentation

- A status is always rendered as a **`Badge` with a text label**.
- The **request status block** on the dashboard shows: the badge, the plain-language next step, and
  a one-line explanation. The internal status key is never shown raw.
- The **timeline** on the dashboard lists the phases reached so far, with the current one
  highlighted.

### 6.5 Motion

| Element | Motion | Duration |
|---|---|---|
| Screen transition | Fade + slight vertical offset (Expo Router default) | 250 ms |
| Sheet | Slide from the bottom | 250 ms |
| Button press | Opacity 0.7 + scale 0.98 | 120 ms |
| Toast | Fade + slide up | 200 ms in / 200 ms out |
| List item insert | Fade | 200 ms |

All motion respects the "reduce motion" setting where the platform exposes it. No looping or
attention-seeking animation.

---

## 7. Accessibility

1. **Every interactive element has an accessible name.** Icon-only buttons require
   `accessibilityLabel`.
2. **Contrast**: all text meets WCAG AA (≥ 4.5:1 for body text, ≥ 3:1 for large text and UI
   boundaries). The carried-over MD3 palette satisfies this on its intended background roles.
3. **Colour is never the only carrier of meaning.** Badges combine colour + text; form errors
   combine colour + icon + text.
4. **Font scaling**: layouts tolerate the OS font scale up to 130 % without truncating content.
   Text is never clipped by a fixed-height container.
5. **Screen reader**: each screen has one `accessibilityRole="header"` for its title. Status changes
   are announced via `AccessibilityInfo.announceForAccessibility`.
6. **Focus order** follows the visual order. A failed submit moves focus to the first invalid field.
7. **Motion** is restrained and non-essential (§6.5).
8. **Touch targets** are ≥ 44×44 dp.
9. **Form fields** are associated with their labels via `accessibilityLabel`, and error text is
   linked to the field.

---

## 8. Responsive Behaviour

| Width | Behaviour |
|---|---|
| ≤ 360 dp | Single column everywhere. Buttons full width. No side-by-side actions. |
| 361–600 dp | Single column, wider gutters. |
| > 600 dp (tablet) | Content is centred with a max width of 640. Cards may use a two-column grid on the dashboard summary. |

The prototype is **designed for 360×640 dp first** and verified there, because that is the lowest
common denominator for budget Android devices in the DRC.

---

## 9. Localization Considerations

- **Two locales: FR (default) and EN.** The decision is explicit: FR is the product's primary
  language; EN is the second supported language. The default is FR unless the device locale is
  English.
- **Structure**: `src/lib/i18n/locales/en.ts` is the canonical key set;
  `src/lib/i18n/locales/fr.ts` is typed as `Record<TranslationKey, string>`, so a missing French
  key is a **compile error**. The key sets cannot drift.
- **Keys are namespaced**: `common.*`, `welcome.*`, `request.type.*`, `child.*`, `need.*`,
  `contact.*`, `pin.*`, `review.*`, `dashboard.*`, `proposal.*`, `contract.*`, `invoice.*`,
  `payment.*`, `receipt.*`, `tutor.*`, `notification.*`, `admin.*`, `validation.*`,
  `error.*`, `status.*`.
- **No hardcoded user-facing strings in components.** Every visible string comes from `t()`.
- **Interpolation**: `t('dashboard.needsCount', { count: 3 })` with `{count}` placeholders. Plural
  handling uses explicit forms (`_one` / `_other`) because French and English differ.
- **Dates and numbers** are formatted with `Intl` using the active locale. Currency is `USD`,
  formatted as `USD 25.00` (FR: `25,00 $US`) — the format is locale-driven, the currency is not
  configurable.
- **Layout must tolerate text expansion.** German-style length problems are a real risk when
  switching FR ↔ EN: no fixed-width buttons, no truncated single-line labels, allow wrapping.
- **Admin screens are French-only in the prototype** (decided). The i18n keys are still namespaced
  under `admin.*` so they can be completed later.
- **Stored content is never translated.** `titleKey` / `bodyKey` in notifications, and all
  status labels, are keys. User-entered content (names, objectives, notes) is stored verbatim and
  displayed as-is.
- **Language switch**: a `SegmentedControl` in the Welcome screen and in the admin profile area.
  The choice is persisted in the session store and applied immediately without a restart.

---

## 10. Known Gaps in the Visual System

| Gap | Impact | Proposed handling |
|---|---|---|
| ~~No final logo mark~~ | ~~The app opens with the wordmark only~~ | **Closed in S05** — `assets/mon-precepteur-logo.png` is the lock-up; the wordmark stays as text |
| No illustrations / empty-state artwork | Empty states are icon-only | Acceptable; icons are drawn from Lucide. Add illustrations later if requested. |
| No dark mode | Light only | Accepted for the prototype |
| ~~Semantic status colours unapproved~~ | ~~Status badges depend on them~~ | **Closed in S02** — approved (R-13), see §3.3 |
| No motion personality in V1 | Motion tokens are new | Defined in §6.5 as a restrained default |
| No avatar imagery | Users have no photos in the prototype | Initials avatars; photo upload is out of scope |
| `DateField` and `Attachment` not built | Two rows of §5 are unimplemented | Deferred in S02 pending their native dependencies (R-25, R-16) |
