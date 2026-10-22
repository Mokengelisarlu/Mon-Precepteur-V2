# Design & UX Specification — Mon Précepteur V2

> **This is the authoritative UI/UX source of truth for Mon Précepteur V2.**
> Companion documents: `context/ui-context.md` (tokens and component library),
> `context/business-rules.md` (states and validation), `context/architecture.md` (structure),
> `context/project-overview.md` (scope), `context/step-features.md` (implementation order).
> When this document and `context/ui-context.md` disagree on a screen-level detail, this document
> wins. When it disagrees with `context/business-rules.md` on a rule or a status, **that document
> wins** — this one is corrected.

---

## 1. Design Principles

1. **A guided conversation, not an administrative form.** The conceptual flow is:
   *Who needs help? → What do they need? → How can we contact you? → We take care of the rest.*
2. **One primary action per screen.** It is the last element of the scroll view, pinned to the
   bottom where a form or a decision is involved.
3. **Short screens.** Each screen asks for one thing. A screen needing more than one sheet becomes
   a route.
4. **Progressive disclosure.** Optional fields are collapsed behind a "Add" affordance; the
   required path stays short.
5. **Plain language.** Every state and every instruction is written for a person with limited
   technical confidence.
6. **The client is never shown administrative tooling.** The admin simulation is a separate,
   clearly labelled workspace.
7. **Honesty.** Every simulated action is labelled as simulated. The app never implies it sent an
   SMS, verified a payment automatically, or produced a legally valid signature.
8. **Progress is visible.** The request flow shows the current step and its progress.
9. **Nothing is lost.** The draft survives an app restart, and every form can be corrected without
   starting over.
10. **Accessible by default.** Labels, roles, 44 dp targets, no colour-only meaning, and text that
    survives a 130 % font scale.

---

## 2. Information Architecture

```
Welcome
└─ Request type (sheet)
   ├─ For my child → Children list → Child form (sheet) → Child needs → Need form (sheet)
   └─ For myself   → Adult needs → Need form (sheet)
                                          ↓
                              Contact details → PIN → Review & submit → Submitted
                                          ↓
                                   Client dashboard
                                          ├─ Proposal → Contract → Invoice → Payment → Receipt
                                          ├─ Assigned tutor
                                          └─ Notifications

Administration (simulation) → Admin dashboard → Request detail
   ├─ Proposal builder → Contract preparation → Invoice preparation
   ├─ Payment verification → Receipt issuance
   ├─ Tutor assignment
   └─ Activity history
```

### 2.1 Route titles

Every screen except Welcome and Submitted shows a header with a back button and a centred title.
The title is never the file name: it comes from the `nav.*` keys of the dictionaries and is set by
the stack layout.

| Route | English | Français |
|---|---|---|
| `/request-type` | Request type | Type de demande |
| `/children` | Children | Enfants |
| `/children/form` | Child details | Détails de l'enfant |
| `/needs/child/[childId]` | Needs | Besoins |
| `/needs/self` | Needs | Besoins |
| `/contact` | Contact details | Coordonnées |
| `/pin` | PIN | Code PIN |
| `/review` | Review and submit | Vérifier et envoyer |
| `/dashboard` | Dashboard | Tableau de bord |
| `/proposal/[proposalId]` | Proposal | Proposition |
| `/contract/[contractId]` | Contract | Contrat |
| `/invoice/[invoiceId]` | Invoice | Facture |
| `/payment/[invoiceId]` | Payment | Paiement |
| `/receipt/[receiptId]` | Receipt | Reçu |
| `/tutor/[needId]` | Tutor | Précepteur |
| `/notifications` | Notifications | Notifications |
| `/admin` | Admin dashboard | Tableau de bord admin |
| `/admin/request/[requestId]` | Request detail | Détail de la demande |
| `/admin/proposal/new` | Proposal builder | Création de la proposition |
| `/admin/contract/new` | Contract preparation | Préparation du contrat |
| `/admin/invoice/new` | Invoice preparation | Préparation de la facture |
| `/admin/payment/[paymentId]` | Payment verification | Vérification du paiement |
| `/admin/receipt/issue` | Receipt issuance | Émission du reçu |
| `/admin/assignment` | Tutor assignment | Affectation du précepteur |
| `/admin/history` | Activity history | Historique d'activité |

The admin stack uses the `surface-highest` header background, and the admin workspace always
carries the simulation notice of §9.

---

## 3. The Request Flow Header

A compact stepper appears on every screen of the request flow (children, needs, contact, PIN,
review):

- **Steps shown:** 4 for the parent journey (Enfants · Besoins · Coordonnées · PIN), 3 for the adult
  journey (Besoins · Coordonnées · PIN).
- **The current step is highlighted** with the primary colour and a bolder weight; completed steps
  show a check icon; future steps are muted.
- **The step title** is shown next to the stepper.
- **A progress bar** under the stepper shows the overall completion.
- The stepper is **not interactive** in the prototype (the client cannot jump ahead), but it is
  labelled with the current step for screen readers: "Étape 2 sur 4 : Besoins".

| | English | Français |
|---|---|---|
| Step 1 (parent) | Children | Enfants |
| Step 2 (parent) | Needs | Besoins |
| Step 3 | Contact | Coordonnées |
| Step 4 | PIN | Code PIN |
| Step 1 (adult) | Needs | Besoins |
| Step 2 | Contact | Coordonnées |
| Step 3 | PIN | Code PIN |

---

## 4. Client Screens

### W-01 — Welcome

- **Purpose:** Introduce Mon Précepteur and invite the client to start, with no forced registration.
- **Target user:** Any visitor; a returning client (a persisted draft or an existing client profile).
- **Entry point:** App launch. Also the back target of the whole request flow.
- **Primary action:** "Get Started" → Request type sheet (`/request-type`).
- **Secondary actions:** "Continue your request" (only when a draft exists — opens a sheet);
  "Administration (simulation)" → the admin workspace; the language switch.
- **Content:**
  - The brand lock-up: the logo asset `assets/mon-precepteur-logo.png` above the wordmark and the
    tagline. The wordmark is text, the tagline is the only `accessibilityRole="header"`.
  - A one-paragraph value proposition: *"Describe your learning need. We find the tutor, prepare the
    contract, and handle the paperwork."*
  - Three reassurance points (icon + one line): a suitable tutor is chosen for you; a written
    contract; payment verified before the service starts.
  - The language switch (`SegmentedControl`: FR / EN).
- **Layout order (implemented):** brand lock-up → value proposition → **primary CTA** →
  reassurance points → language switch → secondary actions. The CTA is the first focusable element
  and the single dominant action; everything below it is secondary.
- **Validation:** None.
- **Loading state:** While the app restores the persisted state, a centred spinner replaces the
  content area.
- **Empty state:** n/a — the welcome screen is always populated.
- **Error state:** If restoration fails, a dismissible banner at the top: *"Some information could
  not be restored. You can start again."*
- **Success state:** n/a.
- **Navigation destinations:** Request type sheet; the admin workspace; the "continue" sheet.
- **Required components:** `Button`, `SegmentedControl`, `Surface`, `Icon`, `Sheet`, `Badge`.
- **Accessibility:** The heading is the only `accessibilityRole="header"`. The CTA is the first
  focusable element. The three reassurance points are grouped as a list with a label. The language
  switch announces the selected language.
- **Implementation seams (S05):** the screen receives `hasDraft` and `restorationState` as props
  until the persistence layer (S13) and the draft store (S14) exist. Both default to "no draft" and
  "idle", so the "continue" entry and the restoring spinner are not reachable yet. The
  "continue your request" sheet exists and is exercised by the tests, but stays hidden.
- **Labels:**

| English | Français |
|---|---|
| Mon Précepteur | Mon Précepteur |
| Your need, our tutor. | Votre besoin, notre précepteur. |
| Describe your learning need. We find the tutor, prepare the contract and handle the paperwork. | Décrivez votre besoin. Nous trouvons le précepteur, préparons le contrat et gérons les formalités. |
| A tutor chosen for your needs | Un précepteur adapté à vos besoins |
| A written contract | Un contrat écrit |
| Payment verified before starting | Un paiement vérifié avant de commencer |
| What we take care of for you | Ce que nous prenons en charge pour vous |
| Get Started | Commencer |
| Continue your request | Reprendre votre demande |
| Administration (simulation) | Administration (simulation) |
| Simulation | Simulation |
| Language | Langue |
| Some information could not be restored. You can start again. | Certaines informations n'ont pas pu être restaurées. Vous pouvez recommencer. |
| Your request was saved. Continue where you stopped. | Votre demande a été enregistrée. Reprenez là où vous vous êtes arrêté. |

---

### W-02 — Request type (bottom sheet)

- **Purpose:** Ask who the tutoring is for, and route accordingly.
- **Target user:** Any visitor.
- **Entry point:** The "Get Started" CTA on Welcome.
- **Primary action:** Choose one of the two options.
- **Secondary actions:** Dismiss the sheet (swipe down / back) → Welcome.
- **Content:** A title, two large tappable options, each with an icon, a title and a one-line
  explanation.
  - **For my child** — *"Register your children and their school needs."*
  - **For myself** — *"Get training or tutoring for yourself."*
- **Validation:** None.
- **Loading state:** None.
- **Empty state:** n/a.
- **Error state:** n/a.
- **Success state:** The sheet closes and the flow continues.
- **Navigation destinations:** Children list (W-03) or Adult needs (W-07).
- **Required components:** `Sheet`, `ListItem` (large variant), `Icon`.
- **Accessibility:** The sheet is a modal dialog: focus is trapped, the title is the header, and the
  options are announced as "button, 2 of 2". Escape/back dismisses it.
- **Labels:**

| English | Français |
|---|---|
| Who needs tutoring? | Qui a besoin d'un précepteur ? |
| For my child | Pour mon enfant |
| Register your children and describe their school needs. | Enregistrez vos enfants et décrivez leurs besoins scolaires. |
| For myself | Pour moi-même |
| Get tutoring or training for yourself. | Suivez un cours ou une formation pour vous-même. |

---

### W-03 — Children list

- **Purpose:** Let the parent manage the children included in the request.
- **Target user:** Parent / guardian.
- **Entry point:** W-02 → "For my child".
- **Primary action:** "Continue" → Child needs (W-05).
- **Secondary actions:** "Add a child" → the child form sheet; tap a child to edit; swipe or use
  the row's overflow to remove (with confirmation).
- **Content:** The request-flow header (step 1 of 4); the list of children, each row showing an
  initials avatar, the full name, the level, the age and the school; a hint line stating that a
  child may have several needs.
- **Validation:** The "Continue" action is disabled while there is no child.
- **Loading state:** A skeleton list of 2–3 rows.
- **Empty state:** An illustration-free empty state (a people icon, a title, one sentence) with an
  "Add a child" CTA.
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** After adding a child, a toast: *"Child added."*
- **Navigation destinations:** Child form sheet (W-04); Child needs (W-05).
- **Required components:** `ListItem`, `Avatar`, `Button`, `EmptyState`, `Sheet`, `Dialog`, `Toast`,
  `Stepper`.
- **Accessibility:** Each row is one focusable element announcing the name, the level and the age.
  The remove action is reachable without swiping (an overflow button in the row) so it is not
  gesture-only.
- **Labels:**

| English | Français |
|---|---|
| Children | Enfants |
| Which children need support? | Quels enfants ont besoin d'un accompagnement ? |
| Add a child | Ajouter un enfant |
| Continue | Continuer |
| No children yet | Aucun enfant pour l'instant |
| Add your first child to start a request. | Ajoutez votre premier enfant pour commencer une demande. |
| Child added. | Enfant ajouté. |
| Remove this child? | Retirer cet enfant ? |
| Remove | Retirer |
| Cancel | Annuler |
| A child can have several needs. | Un enfant peut avoir plusieurs besoins. |

---

### W-04 — Child form (bottom sheet)

- **Purpose:** Add or edit a child's details.
- **Target user:** Parent / guardian.
- **Entry point:** "Add a child" or an existing child row on W-03.
- **Primary action:** "Save" → back to W-03 with the child saved.
- **Secondary actions:** Cancel (dismiss the sheet).
- **Content and fields:**

| Field | Type | Required | Placeholder (FR) |
|---|---|---|---|
| First name | Text | Yes | Prénom |
| Last name | Text | No | Nom (facultatif) |
| Date of birth | Date picker | Yes* | Date de naissance |
| Age | Number | Yes* | Âge |
| School level | Select | Yes | Classe / niveau |
| School | Text | No | École (facultatif) |
| Additional information | TextArea | No | Informations complémentaires (facultatif) |

  \* Exactly one of date of birth or age.

  The level select offers: *Primaire* (with levels P1–P6), *Secondaire* (1re–6e), *Autres / non
  précisé*.

- **Validation:** Per `context/business-rules.md` §11.1. Errors appear under the field on blur, and
  the first errored field is focused on submit.
- **Loading state:** The "Save" button shows a spinner and is disabled.
- **Empty state:** n/a.
- **Error state:** Inline field errors; if the save fails, a toast with the reason.
- **Success state:** A toast: *"Child saved."* / *"Child updated."*
- **Navigation destinations:** W-03.
- **Required components:** `Sheet`, `Input`, `Select`, `TextArea`, `Button`, `DateField`.
- **Accessibility:** The sheet is modal (focus trapped). Labels are always visible above the field.
  The date picker exposes a native accessibility date control. Error text is associated with its
  field.
- **Labels:**

| English | Français |
|---|---|
| Add a child | Ajouter un enfant |
| Edit the child | Modifier l'enfant |
| First name | Prénom |
| Last name | Nom (facultatif) |
| Date of birth | Date de naissance |
| Age | Âge |
| School level | Classe / niveau |
| School | École (facultatif) |
| Additional information | Informations complémentaires (facultatif) |
| Save | Enregistrer |
| Cancel | Annuler |
| Child saved. | Enfant enregistré. |
| Child updated. | Enfant mis à jour. |

---

### W-05 — Child needs

- **Purpose:** Describe one or more learning needs for one child, and set the tutor preference.
- **Target user:** Parent / guardian.
- **Entry point:** W-03 → "Continue".
- **Primary action:** "Continue" → Contact details (W-08).
- **Secondary actions:** "Add a need" → the need form sheet; edit or remove an existing need.
- **Content:** The request-flow header (step 2 of 4); the child's name; the list of needs, each
  showing the subject, the level, the objective, the cadence and the session length; the
  tutor-preference control with its explanatory note; a hint that a need may later be covered by a
  different tutor.
- **Validation:** The "Continue" action requires ≥ 1 need. The tutor-preference control always has
  a value (default "no preference").
- **Loading state:** A skeleton list.
- **Empty state:** An empty state with an "Add a need" CTA and the sentence *"Describe what this
  child needs to work on."*
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** A toast: *"Need added."*
- **Navigation destinations:** Need form sheet (W-06); Contact details (W-08); back to W-03.
- **Required components:** `ListItem`, `Badge`, `Sheet`, `Button`, `EmptyState`, `SegmentedControl`,
  `Stepper`.
- **Accessibility:** Each need row announces the subject and the cadence. The preference control is
  a radio group with an accessible description carrying the "not a guarantee" note.
- **Labels:**

| English | Français |
|---|---|
| Needs | Besoins |
| What does {name} need? | Que doit travailler {name} ? |
| Add a need | Ajouter un besoin |
| Continue | Continuer |
| No needs yet | Aucun besoin pour l'instant |
| Describe what this child needs to work on. | Décrivez ce sur quoi cet enfant doit travailler. |
| Tutor preference | Préférence de précepteur |
| The same tutor if possible | Le même précepteur si possible |
| Different tutors | Des précepteurs différents |
| No preference | Aucune préférence |
| This is a preference, not a guarantee. | C'est une préférence, pas une garantie. |
| Need added. | Besoin ajouté. |

---

### W-06 — Need form (bottom sheet)

- **Purpose:** Capture the detail of one learning need.
- **Target user:** Parent / guardian and adult learner.
- **Entry point:** "Add a need" on W-05 or W-07.
- **Primary action:** "Save" → back to the needs list.
- **Secondary actions:** Cancel (dismiss the sheet).
- **Content and fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Subject or skill | Text + suggestions | Yes | Subject chips: Mathématiques, Français, Anglais, Physique, Chimie, Sciences, Informatique, Préparation examens, Autre |
| Current level | Text | Yes | e.g. "3e", "Débutant" |
| Learning objective | TextArea | Yes | Minimum 5 characters |
| Frequency | Select | Yes | 1×/semaine, 2×/semaine, 3×/semaine, 1×/mois, Flexible |
| Session length | Select | Yes | 30, 45, 60, 90, 120 minutes |
| Availability | TextArea | Yes | Free text, e.g. "Mardi et jeudi après 16 h" |
| Preferred format | Segmented control | Yes | À domicile, En ligne, Au centre |
| Location | Text | Conditional | Required for *À domicile* and *Au centre*; hidden for *En ligne* |
| Additional notes | TextArea | No | |

- **Validation:** Per `context/business-rules.md` §11.2. The location field appears or disappears as
  the format changes, and the requirement is re-evaluated at submit.
- **Loading state:** The "Save" button shows a spinner.
- **Empty state:** n/a.
- **Error state:** Inline field errors.
- **Success state:** A toast: *"Need saved."*
- **Navigation destinations:** W-05 or W-07.
- **Required components:** `Sheet`, `Input`, `TextArea`, `Select`, `SegmentedControl`, `Button`.
- **Accessibility:** The format control announces the selection; when the format changes, the
  newly revealed field is announced. The subject suggestions are a horizontal chip list.
- **Labels:**

| English | Français |
|---|---|
| Subject or skill | Matière ou compétence |
| Current level | Niveau actuel |
| Learning objective | Objectif d'apprentissage |
| Frequency | Fréquence |
| Session length | Durée de la séance |
| Availability | Disponibilités |
| Preferred format | Format préféré |
| At home | À domicile |
| Online | En ligne |
| At a learning centre | Au centre |
| Location | Localisation |
| Additional notes | Remarques (facultatif) |
| Save | Enregistrer |
| Need saved. | Besoin enregistré. |

---

### W-07 — Adult learning needs

- **Purpose:** Capture the adult learner's needs without any child registration.
- **Target user:** Adult learner.
- **Entry point:** W-02 → "For myself".
- **Primary action:** "Continue" → Contact details (W-08).
- **Secondary actions:** "Add a need" → the need form sheet; edit or remove a need.
- **Content:** The request-flow header (step 1 of 3); the title *"What do you need to work on?"*; the
  need list; the tutor-preference control.
- **Validation:** ≥ 1 need to continue.
- **Loading state:** A skeleton list.
- **Empty state:** An empty state with an "Add a need" CTA.
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** A toast: *"Need added."*
- **Navigation destinations:** Need form sheet (W-06); Contact details (W-08).
- **Required components:** Same as W-05.
- **Accessibility:** Same as W-05. The screen explicitly does **not** mention children.
- **Labels:**

| English | Français |
|---|---|
| What do you need to work on? | Sur quoi souhaitez-vous travailler ? |
| Your learning needs | Vos besoins d'apprentissage |
| Add a need | Ajouter un besoin |
| Continue | Continuer |
| No needs yet | Aucun besoin pour l'instant |

---

### W-08 — Contact details

- **Purpose:** Collect the client's identity and how to reach them.
- **Target user:** Parent / guardian and adult learner.
- **Entry point:** W-05 or W-07 → "Continue".
- **Primary action:** "Continue" → PIN (W-09).
- **Secondary actions:** Back.
- **Content and fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| First name | Text | Yes | |
| Last name | Text | Yes | |
| Phone number | Text (numeric keypad) | Yes | The primary identifier; a helper line explains that it is used to identify the account and to receive updates |
| Email | Text (email keyboard) | No | |
| Neighbourhood / address | Text | No | |

- **Validation:** Per `context/business-rules.md` §11.3. The phone is normalised before storing.
- **Loading state:** The "Continue" button shows a spinner while the client profile is checked for
  duplicates.
- **Empty state:** n/a.
- **Error state:** Inline field errors. If the phone matches an existing client, a **sheet** appears:
  *"You already have an account with this number. Continue with your existing request history?"*
  with "Continue" and "Use another number".
- **Success state:** n/a (it navigates).
- **Navigation destinations:** PIN (W-09); back to the needs screen.
- **Required components:** `Input`, `Button`, `Sheet`, `Stepper`.
- **Accessibility:** The helper line under the phone field is read as the field's description. The
  numeric keyboard is set. Error messages are announced.
- **Labels:**

| English | Français |
|---|---|
| Contact details | Coordonnées |
| How can we reach you? | Comment vous joindre ? |
| First name | Prénom |
| Last name | Nom |
| Phone number | Numéro de téléphone |
| We use this number to identify your account and to contact you about your request. | Ce numéro nous sert à identifier votre compte et à vous contacter au sujet de votre demande. |
| Email (optional) | E-mail (facultatif) |
| Neighbourhood (optional) | Quartier (facultatif) |
| Continue | Continuer |
| You already have an account with this number. | Vous avez déjà un compte avec ce numéro. |
| Continue with your existing request history? | Poursuivre avec l'historique de vos demandes ? |
| Use another number | Utiliser un autre numéro |

---

### W-09 — PIN

- **Purpose:** Create the access PIN and explain its role honestly.
- **Target user:** All clients.
- **Entry point:** W-08 → "Continue".
- **Primary action:** "Continue" → Review (W-10).
- **Secondary actions:** Back; a "Change the PIN" action once set (returns to this screen).
- **Content:** The request-flow header (the last step); a four-digit PIN field; a confirmation
  field; an information card explaining the PIN's purpose **and** that this is a demonstration:
  *"This prototype stores your code on your device only, in a hashed form. It is not real
  authentication."*
- **Validation:** 4 digits; the confirmation must match. A mismatch shows *"The codes do not
  match."* under the confirmation field.
- **Loading state:** The "Continue" button shows a spinner while hashing and saving.
- **Empty state:** n/a.
- **Error state:** Inline field errors. A hashing/storage failure shows a toast: *"The code could
  not be saved. Try again."*
- **Success state:** The PIN is stored (hashed) and the flow advances.
- **Navigation destinations:** Review (W-10); back to W-08.
- **Required components:** `PinInput`, `Input`, `Card`, `Button`, `Stepper`, `Toast`.
- **Accessibility:** The PIN field is a single accessible field with the value masked. The
  information card is a labelled region. Errors are announced.
- **Labels:**

| English | Français |
|---|---|
| Create your access code | Créez votre code d'accès |
| Choose a 4-digit code you will remember. | Choisissez un code à 4 chiffres que vous retiendrez. |
| Access code | Code d'accès |
| Confirm the code | Confirmez le code |
| The codes do not match. | Les codes ne correspondent pas. |
| How is this code used? | À quoi sert ce code ? |
| It lets you open your dashboard and find your requests, contracts and receipts. | Il vous permet d'ouvrir votre tableau de bord et de retrouver vos demandes, contrats et reçus. |
| Demo only: this code is stored on your device in a hashed form. It is not real authentication. | Démo uniquement : ce code est enregistré sur votre appareil sous forme hachée. Ce n'est pas une authentification réelle. |
| Continue | Continuer |

---

### W-10 — Review and submit

- **Purpose:** Let the client check everything before submitting.
- **Target user:** All clients.
- **Entry point:** W-09 → "Continue".
- **Primary action:** "Submit the request" → Submitted (W-11).
- **Secondary actions:** Per-section "Edit" links back to the relevant step.
- **Content:** A summary in sections: *Children* (or *Learner*), *Needs*, *Contact details*,
  *Tutor preference*. Each section has an "Edit" action.
- **Validation:** The submission service refuses an incomplete request with a precise message
  ("Add at least one need before submitting").
- **Loading state:** The primary button shows a spinner.
- **Empty state:** n/a.
- **Error state:** If the submission fails, an `ErrorState` above the button with a "Try again"
  action; nothing is lost.
- **Success state:** Navigation to W-11.
- **Navigation destinations:** W-11; the editable steps.
- **Required components:** `Card`, `KeyValue`, `Button`, `ErrorState`, `Badge`.
- **Accessibility:** The sections are headings; the "Edit" actions announce which section they edit
  ("Edit contact details").
- **Labels:**

| English | Français |
|---|---|
| Check your request | Vérifiez votre demande |
| Children | Enfants |
| Learner | Apprenant |
| Needs | Besoins |
| Contact details | Coordonnées |
| Tutor preference | Préférence de précepteur |
| Edit | Modifier |
| Submit the request | Envoyer la demande |
| Add at least one need before submitting. | Ajoutez au moins un besoin avant d'envoyer. |

---

### W-11 — Submitted (confirmation)

- **Purpose:** Confirm the submission and set the expectation for what happens next.
- **Target user:** All clients.
- **Entry point:** W-10 → "Submit the request".
- **Primary action:** "Go to my dashboard" → W-12.
- **Secondary actions:** None.
- **Content:** A success mark; the title *"Your request has been received"*; the request reference in
  a `KeyValue` row; a three-line explanation of the next steps (we review the needs, we propose a
  tutor, you confirm before anything is charged); a reassurance line that the service starts only
  after payment is verified.
- **Validation:** None.
- **Loading state:** None.
- **Empty state:** n/a.
- **Error state:** If the dashboard cannot be loaded, a "Try again" action.
- **Success state:** The screen itself is the success state.
- **Navigation destinations:** W-12.
- **Required components:** `Card`, `KeyValue`, `Button`.
- **Accessibility:** The success mark is accompanied by the title text (never colour alone). The
  reference is selectable text.
- **Labels:**

| English | Français |
|---|---|
| Your request has been received | Votre demande a bien été reçue |
| Request reference | Référence de la demande |
| What happens next? | Et ensuite ? |
| 1. We review the needs and look for a suitable tutor. | 1. Nous analysons les besoins et cherchons un précepteur adapté. |
| 2. You receive a proposal with the price and the conditions. | 2. Vous recevez une proposition avec le prix et les conditions. |
| 3. You confirm. The contract and the invoice are prepared. | 3. Vous confirmez. Le contrat et la facture sont préparés. |
| Payment is verified before the service starts. | Le paiement est vérifié avant le début du service. |
| Go to my dashboard | Aller à mon tableau de bord |

---

### W-12 — Client dashboard

- **Purpose:** Answer the single question *"Where does my request stand?"* — and show the next step.
- **Target user:** All clients.
- **Entry point:** W-11, the app icon, or the "my requests" list.
- **Primary action:** Depends on the state — the **next step** is rendered as the primary button:
  "Review the proposal", "Sign the contract", "Pay the invoice", "Declare your payment", "See your
  tutor".
- **Secondary actions:** Open the request detail, the notifications centre (with an unread badge),
  switch language, "Administration (simulation)".
- **Content:**
  1. A greeting: *"Hello {firstName}."*
  2. The request status card: a `Badge` with the status, the **next step** in plain language, a
     one-line explanation, and the request reference.
  3. The **timeline**: the phases reached, the current one highlighted.
  4. The **needs** card: each need with its subject, its level, its cadence, and — when assigned —
     the tutor's initials.
  5. The **proposal** card (when one exists): the price, the frequency, the duration, and a
     "Review the proposal" action.
  6. The **contract** card: the status and the "View the contract" action.
  7. The **invoice** card: the number, the amount, the status.
  8. The **payment** card: the status — *Awaiting payment*, *Awaiting verification*, *Verified*,
     *Rejected* — and the "Declare a payment" action.
  9. The **assigned tutor** card: the tutor's name, the subject, the format, the contact.
  10. The **requests list** when the client has several requests.
- **Validation:** n/a.
- **Loading state:** Skeleton cards.
- **Empty state:** *"No request yet."* + a "Start a request" CTA.
- **Error state:** An `ErrorState` per failed card, with a "Try again" action; the rest of the
  dashboard still renders.
- **Success state:** n/a (it is a read screen, apart from the next-step action).
- **Navigation destinations:** Proposal (W-13), Contract (W-14), Invoice (W-15), Payment (W-16),
  Receipt (W-17), Tutor (W-18), Notifications (W-19).
- **Required components:** `Card`, `Badge`, `Button`, `Timeline`, `KeyValue`, `Avatar`,
  `EmptyState`, `ErrorState`, `Skeleton`.
- **Accessibility:** The status badge includes its label; the timeline is a list with the current
  step marked. The next-step button is the first focusable element after the greeting.
- **Labels:**

| English | Français |
|---|---|
| Hello {firstName}. | Bonjour {firstName}. |
| Where does your request stand? | Où en est votre demande ? |
| Request reference | Référence de la demande |
| Next step | Étape suivante |
| Review the proposal | Consulter la proposition |
| Sign the contract | Signer le contrat |
| Pay the invoice | Régler la facture |
| Declare your payment | Déclarer votre paiement |
| See your tutor | Voir votre précepteur |
| View the proposal | Voir la proposition |
| View the contract | Voir le contrat |
| View the invoice | Voir la facture |
| View the receipt | Voir le reçu |
| No request yet | Aucune demande pour l'instant |
| Start a request | Commencer une demande |
| My requests | Mes demandes |
| Notifications | Notifications |

---

### W-13 — Proposal detail

- **Purpose:** Let the client review a proposal and accept or reject it.
- **Target user:** All clients.
- **Entry point:** The proposal card on W-12.
- **Primary action:** "Accept the proposal" (when the status is `sent`).
- **Secondary actions:** "Decline" (opens a sheet with an optional reason); back.
- **Content:** The status badge; the covered needs (subject and level per need); the tutor
  recommended (name, subjects, formats); the price, the billing cycle, the frequency, the session
  length, the duration and the conditions.
- **Validation:** A rejection reason is optional but must be ≤ 500 characters.
- **Loading state:** A skeleton body.
- **Empty state:** n/a (an unknown id shows the not-found state).
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** On acceptance, a toast: *"Proposal accepted."* and the dashboard updates to the
  next step. On rejection: a toast: *"Proposal declined."*
- **Navigation destinations:** W-12.
- **Required components:** `Card`, `Badge`, `KeyValue`, `Button`, `Sheet`, `Toast`, `Avatar`.
- **Accessibility:** The accept button is the last focusable element. The rejection action is
  visually distinct (outlined, not filled) so the two are never confused. A confirmation dialog is
  **not** used for acceptance — the acceptance is immediate and reversible only by an administrator.
- **Labels:**

| English | Français |
|---|---|
| Service proposal | Proposition de service |
| Recommended tutor | Précepteur proposé |
| Covered needs | Besoins couverts |
| Price | Prix |
| Frequency | Fréquence |
| Session length | Durée de la séance |
| Commitment | Durée de l'engagement |
| Conditions | Conditions |
| Accept the proposal | Accepter la proposition |
| Decline | Refuser |
| Why are you declining? (optional) | Pourquoi refusez-vous ? (facultatif) |
| Proposal accepted. | Proposition acceptée. |
| Proposal declined. | Proposition refusée. |

---

### W-14 — Contract detail

- **Purpose:** Show the contract terms and let the client sign (simulated).
- **Target user:** All clients.
- **Entry point:** The contract card on W-12.
- **Primary action:** "Sign the contract" (when the status is `issued`) → opens the signature sheet.
- **Secondary actions:** Back; the signature sheet's cancel.
- **Content:** The contract number and status; the parties (for a minor: *Parent/Guardian* and
  *Mon Précepteur*); the covered needs; the terms; a **notice card** stating that the wording is a
  placeholder and the signature is a demonstration.
- **Validation:** The typed signature name must be non-empty and must match the client's name
  loosely (a warning, not a hard block, so a parent signing for a child is not blocked).
- **Loading state:** A skeleton body.
- **Empty state:** n/a.
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** A toast: *"Contract signed."* and the status becomes `signed`.
- **Navigation destinations:** W-12.
- **Required components:** `Card`, `Badge`, `KeyValue`, `Button`, `Sheet`, `Input`, `Toast`.
- **Accessibility:** The notice card is a labelled region, read before the terms. The signature
  sheet's confirmation is explicit: the typed name is announced as the signature.
- **Labels:**

| English | Français |
|---|---|
| Service contract | Contrat de service |
| Contract number | Numéro de contrat |
| Parties | Parties |
| Parent / guardian | Parent / tuteur |
| Terms | Conditions |
| Sign the contract | Signer le contrat |
| Type your full name to sign | Tapez votre nom complet pour signer |
| Signature | Signature |
| Contract signed. | Contrat signé. |
| Demo only: this wording is a placeholder and this signature is a demonstration. It is not a legally binding electronic signature. | Démo uniquement : ce texte est un modèle et cette signature est une démonstration. Il ne s'agit pas d'une signature électronique juridiquement contraignante. |

---

### W-15 — Invoice detail

- **Purpose:** Show what the client has to pay and its status.
- **Target user:** All clients.
- **Entry point:** The invoice card on W-12.
- **Primary action:** "Declare a payment" (when the status is `awaiting_payment`).
- **Secondary actions:** "View the receipt" (when paid); back.
- **Content:** The invoice number and status; the amount due and the currency; the issue date; the
  due date; the billable needs; the **next step** line explaining that a payment must be declared
  and then verified.
- **Validation:** n/a.
- **Loading state:** A skeleton body.
- **Empty state:** n/a.
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** n/a.
- **Navigation destinations:** Payment (W-16); Receipt (W-17); W-12.
- **Required components:** `Card`, `Badge`, `KeyValue`, `Button`.
- **Accessibility:** The status badge carries a label. The amount is announced as text.
- **Labels:**

| English | Français |
|---|---|
| Invoice | Facture |
| Invoice number | Numéro de facture |
| Amount due | Montant dû |
| Issue date | Date d'émission |
| Due date | Date d'échéance |
| Declared payments | Déclarations de paiement |
| Declare a payment | Déclarer un paiement |
| Awaiting payment | En attente de paiement |
| Awaiting verification | En attente de vérification |
| Verified | Vérifié |
| Rejected | Rejeté |
| Payment is checked by our team before it is confirmed. | Votre paiement est vérifié par notre équipe avant d'être confirmé. |

---

### W-16 — Mobile Money payment declaration

- **Purpose:** Let the client declare a Mobile Money transaction.
- **Target user:** All clients.
- **Entry point:** The invoice card on W-12 or the "Declare a payment" action on W-15.
- **Primary action:** "Submit my declaration" → back to W-12/W-15.
- **Secondary actions:** Attach evidence (opens the system picker); cancel.
- **Content and fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Transaction ID | Text | Yes | The reference from the operator's SMS |
| Payer's phone number | Text | Yes | May differ from the client's number |
| Amount paid | Number | Yes | Pre-filled with the invoice amount; must match |
| Operator | Select | Yes | M-Pesa, Orange Money, Airtel Money, Afrimoney, Autre |
| Payment date | Date picker | Yes | Not in the future, not older than 90 days |
| Supporting evidence | Attachment | No | A photo, optional |

  Plus an information card: *"After you submit, our team checks the transaction with the operator.
  You will be notified once it is confirmed."* And a **simulation notice**: *"This prototype does not
  contact any Mobile Money operator."*

- **Validation:** Per `context/business-rules.md` §11.5. A duplicate transaction ID shows: *"This
  transaction has already been declared. Check your receipt and try again."*
- **Loading state:** The submit button shows a spinner.
- **Empty state:** n/a.
- **Error state:** Inline field errors; a duplicate shows a toast plus the inline error.
- **Success state:** A toast: *"Declaration submitted. We are verifying your payment."* and the
  invoice moves to *Awaiting verification*.
- **Navigation destinations:** W-12; W-15.
- **Required components:** `Input`, `Select`, `DateField`, `Button`, `Card`, `Toast`, `Attachment`.
- **Accessibility:** The transaction ID field has a helper line explaining where to find it. The
  information card is read before the form. The amount field announces the expected amount.
- **Labels:**

| English | Français |
|---|---|
| Declare your payment | Déclarez votre paiement |
| Transaction ID | ID de transaction |
| The reference you received from your operator. | La référence reçue auprès de votre opérateur. |
| Payer's phone number | Numéro du payeur |
| May be different from your number. | Peut être différent du vôtre. |
| Amount paid | Montant payé |
| Operator | Opérateur |
| Payment date | Date du paiement |
| Supporting evidence (optional) | Justificatif (facultatif) |
| Submit my declaration | Envoyer ma déclaration |
| After you submit, our team checks the transaction with the operator. You will be notified once it is confirmed. | Après l'envoi, notre équipe vérifie la transaction auprès de l'opérateur. Vous serez prévenu dès sa confirmation. |
| Demo only: this prototype does not contact any Mobile Money operator. | Démo uniquement : ce prototype ne contacte aucun opérateur Mobile Money. |
| Declaration submitted. We are verifying your payment. | Déclaration envoyée. Nous vérifions votre paiement. |
| This transaction has already been declared. Check your receipt and try again. | Cette transaction a déjà été déclarée. Vérifiez votre reçu et réessayez. |
| The declared amount does not match the invoice amount. | Le montant déclaré ne correspond pas au montant de la facture. |

---

### W-17 — Receipt

- **Purpose:** Prove that a payment was verified.
- **Target user:** All clients.
- **Entry point:** The invoice card on W-12 (when paid) or the invoice detail.
- **Primary action:** "Copy the receipt number" (copies to the clipboard) — or "Back to my
  dashboard".
- **Secondary actions:** Back.
- **Content:** The receipt number; the amount; the currency; the issue date; the invoice reference;
  the verified transaction ID; the payer phone; and a note that a receipt is issued only after the
  payment has been checked with the operator.
- **Validation:** n/a.
- **Loading state:** A skeleton body.
- **Empty state:** n/a.
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** On copying, a toast: *"Receipt number copied."*
- **Navigation destinations:** W-12.
- **Required components:** `Card`, `KeyValue`, `Button`, `Toast`.
- **Accessibility:** The receipt number is selectable text and is announced when copied.
- **Labels:**

| English | Français |
|---|---|
| Payment receipt | Reçu de paiement |
| Receipt number | Numéro de reçu |
| Amount | Montant |
| Issue date | Date d'émission |
| Invoice | Facture |
| Verified transaction | Transaction vérifiée |
| Copy the receipt number | Copier le numéro de reçu |
| Receipt number copied. | Numéro de reçu copié. |
| A receipt is issued only after the payment has been verified with the operator. | Un reçu n'est émis qu'après vérification du paiement auprès de l'opérateur. |

---

### W-18 — Assigned tutor

- **Purpose:** Show who will teach the client and under what arrangement.
- **Target user:** All clients.
- **Entry point:** The tutor card on W-12.
- **Primary action:** "Call the tutor" (a `tel:` link) — or back to the dashboard when there is no
  tutor yet.
- **Secondary actions:** Back.
- **Content:** The tutor's name and initials avatar; the subject covered; the agreed format; the
  session length and cadence; the first-session date when known; the tutor's phone number.
- **Validation:** n/a.
- **Loading state:** A skeleton body.
- **Empty state:** *"No tutor has been assigned yet. We will notify you as soon as one is
  available."*
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** n/a.
- **Navigation destinations:** W-12.
- **Required components:** `Card`, `Avatar`, `KeyValue`, `Button`.
- **Accessibility:** The phone action announces the number it will dial.
- **Labels:**

| English | Français |
|---|---|
| Your tutor | Votre précepteur |
| Subject | Matière |
| Format | Format |
| Sessions | Séances |
| Call the tutor | Appeler le précepteur |
| No tutor assigned yet | Aucun précepteur attribué pour l'instant |
| We will notify you as soon as a tutor is assigned. | Nous vous préviendrons dès qu'un précepteur sera attribué. |

---

### W-19 — Notifications

- **Purpose:** Show the client's in-app notifications.
- **Target user:** All clients.
- **Entry point:** The bell icon on W-12 (with the unread badge).
- **Primary action:** Tap a notification → it is marked as read and the relevant screen opens
  (proposal, contract, invoice, payment, tutor), when the notification carries a target.
- **Secondary actions:** "Mark all as read"; back.
- **Content:** The list grouped by day (*Today*, *Yesterday*, an earlier date); each item shows a
  type icon, the title, the body, the time and an unread dot; an **information card** stating that
  notifications are delivered inside the app only.
- **Validation:** n/a.
- **Loading state:** A skeleton list.
- **Empty state:** *"No notifications."* + *"We will let you know when something happens on your
  request."*
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** On reading, the unread dot disappears and the badge count decreases.
- **Navigation destinations:** The target screen of the notification, or W-12.
- **Required components:** `ListItem`, `Badge`, `Button`, `Card`, `EmptyState`, `Skeleton`.
- **Accessibility:** The unread state is conveyed by a dot **and** by the item's accessibility
  label ("unread"). The notification type is announced.
- **Labels:**

| English | Français |
|---|---|
| Notifications | Notifications |
| Mark all as read | Tout marquer comme lu |
| No notifications | Aucune notification |
| We will let you know when something happens on your request. | Nous vous préviendrons dès qu'une étape de votre demande avance. |
| Demo only: notifications are delivered inside the app. No SMS or WhatsApp message is sent. | Démo uniquement : les notifications sont délivrées dans l'application. Aucun SMS ni message WhatsApp n'est envoyé. |

---

## 5. Administrator Screens (Simulation)

> Every admin screen carries a persistent banner: **"Simulation — this workspace is a local
> demonstration with no authentication."** / *« Simulation — cet espace de travail est une
> démonstration locale, sans authentification. »*

### A-01 — Admin dashboard

- **Purpose:** Show the incoming requests and their state.
- **Target user:** Administrator.
- **Entry point:** The "Administration (simulation)" link on W-01.
- **Primary action:** Tap a request → A-02.
- **Secondary actions:** Filter by status; back to the client app.
- **Content:** The simulation banner; a summary row (the number of requests by status); the request
  list, each row showing the reference, the client name, the number of children, the number of
  needs, the age of the request and the status badge.
- **Loading state:** A skeleton list.
- **Empty state:** *"No requests yet."*
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** n/a.
- **Navigation destinations:** A-02; A-09.
- **Required components:** `Card`, `Badge`, `ListItem`, `Button`, `Sheet` (filter), `EmptyState`.
- **Accessibility:** Each row announces the reference, the client, the status and the age.
- **Labels:**

| English | Français |
|---|---|
| Administration (simulation) | Administration (simulation) |
| Simulation — this workspace is a local demonstration with no authentication. | Simulation — cet espace de travail est une démonstration locale, sans authentification. |
| Incoming requests | Demandes entrantes |
| Requests by status | Demandes par statut |
| All requests | Toutes les demandes |
| No requests yet | Aucune demande pour l'instant |
| Request reference | Référence |
| Client | Client |
| Needs | Besoins |
| Submitted | Envoyée |

---

### A-02 — Admin request detail

- **Purpose:** Show everything about a request and offer the actions valid for its current state.
- **Target user:** Administrator.
- **Entry point:** A-01 → a request row.
- **Primary action:** The contextual action for the current state — *"Start the review"*, *"Prepare
  a proposal"*, *"Prepare a contract"*, *"Prepare an invoice"*, *"Verify the payment"*, *"Assign a
  tutor"*.
- **Secondary actions:** "View the activity history"; back.
- **Content:** The request reference and status; the client (name, phone, email, address); the
  children with their level and age; every need (subject, level, objective, cadence, session
  length, availability, format, location) grouped by child; the tutor preference; the history of
  the proposals, contracts, invoices and payments; the activity timeline.
- **Validation:** n/a.
- **Loading state:** Skeleton cards.
- **Empty state:** n/a (an unknown id shows the not-found state).
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** Each action shows a toast confirming the transition.
- **Navigation destinations:** A-03, A-04, A-05, A-06, A-08, A-09.
- **Required components:** `Card`, `Badge`, `KeyValue`, `Button`, `ListItem`, `Timeline`.
- **Accessibility:** The sections are headings; the contextual action is the only filled button.
- **Labels:**

| English | Français |
|---|---|
| Request | Demande |
| Client | Client |
| Children | Enfants |
| Needs | Besoins |
| Tutor preference | Préférence de précepteur |
| Documents | Documents |
| Activity history | Historique |
| Start the review | Démarrer l'analyse |
| Prepare a proposal | Préparer une proposition |
| Prepare a contract | Préparer un contrat |
| Prepare an invoice | Préparer une facture |
| Verify the payment | Vérifier le paiement |
| Assign a tutor | Attribuer un précepteur |

---

### A-03 — Proposal builder

- **Purpose:** Create and send a proposal.
- **Target user:** Administrator.
- **Entry point:** A-02 → "Prepare a proposal".
- **Primary action:** "Send the proposal".
- **Secondary actions:** "Save as draft"; back.
- **Content and fields:** The covered needs (a multi-select, filtered to the request's uncovered
  needs); the recommended tutor (a select, filtered by the chosen needs' subjects and formats, with
  the ineligible tutors disabled and the reason shown); the price and the currency; the billing
  cycle; the frequency; the session length; the commitment duration; the conditions.
- **Validation:** ≥ 1 need; a tutor must be eligible for every chosen need; the price must be > 0.
- **Loading state:** The send button shows a spinner.
- **Empty state:** If the request has no uncovered needs: *"All needs are already covered by an
  accepted proposal."*
- **Error state:** Inline field errors; a `DUPLICATE_TRANSACTION`-style error is not applicable here,
  but a guard failure (G-05) is shown inline: *"This need is already covered by an accepted
  proposal."*
- **Success state:** A toast: *"Proposal sent."* and a return to A-02.
- **Navigation destinations:** A-02.
- **Required components:** `Input`, `Select`, `MultiSelect`, `Button`, `Card`, `Toast`.
- **Accessibility:** Ineligible tutors are disabled with an accessible description explaining why.
- **Labels:**

| English | Français |
|---|---|
| New proposal | Nouvelle proposition |
| Covered needs | Besoins couverts |
| Recommended tutor | Précepteur proposé |
| Price | Prix |
| Currency | Devise |
| Billing cycle | Cycle de facturation |
| Monthly | Mensuel |
| Per session | À la séance |
| One-off | Forfait |
| Frequency | Fréquence |
| Session length | Durée de la séance |
| Commitment | Durée de l'engagement |
| Conditions | Conditions |
| Send the proposal | Envoyer la proposition |
| Save as draft | Enregistrer le brouillon |
| Proposal sent. | Proposition envoyée. |
| This tutor does not cover this subject. | Ce précepteur n'assure pas cette matière. |
| This need is already covered by an accepted proposal. | Ce besoin est déjà couvert par une proposition acceptée. |

---

### A-04 — Contract preparation

- **Purpose:** Prepare and issue a contract from an accepted proposal.
- **Target user:** Administrator.
- **Entry point:** A-02 → "Prepare a contract".
- **Primary action:** "Issue the contract".
- **Secondary actions:** "Save as draft"; back.
- **Content and fields:** The proposal being contracted (a read-only summary); the contract number
  (auto-generated, editable); the parties; the terms (a pre-filled placeholder, editable).
- **Validation:** The number must be unique; the terms must be non-empty.
- **Loading state:** The issue button shows a spinner.
- **Empty state:** If the proposal is not accepted: *"Only an accepted proposal can be contracted."*
- **Error state:** Inline field errors; a duplicate number shows *"This contract number already
  exists."*
- **Success state:** A toast: *"Contract issued."* and a return to A-02.
- **Navigation destinations:** A-02.
- **Required components:** `Input`, `TextArea`, `Button`, `Card`, `Toast`.
- **Accessibility:** The terms field carries a helper line stating that the wording is a placeholder
  awaiting legal validation.
- **Labels:**

| English | Français |
|---|---|
| New contract | Nouveau contrat |
| Contract number | Numéro de contrat |
| Parties | Parties |
| Terms | Conditions |
| Issue the contract | Émettre le contrat |
| Contract issued. | Contrat émis. |
| This contract number already exists. | Ce numéro de contrat existe déjà. |
| Placeholder wording — to be validated by a legal professional before production. | Texte provisoire — à faire valider par un professionnel du droit avant la mise en production. |

---

### A-05 — Invoice preparation

- **Purpose:** Create and issue an invoice.
- **Target user:** Administrator.
- **Entry point:** A-02 → "Prepare an invoice".
- **Primary action:** "Issue the invoice".
- **Secondary actions:** "Save as draft"; back.
- **Content and fields:** The proposal being invoiced; the invoice number (auto-generated); the
  billable needs (multi-select, defaulting to the proposal's needs); the amount (defaulting to the
  proposal price); the issue date; the due date (optional).
- **Validation:** The number must be unique; the amount must be > 0; ≥ 1 need must be selected.
- **Loading state:** The issue button shows a spinner.
- **Empty state:** If there is no accepted proposal: *"Only an accepted proposal can be invoiced."*
- **Error state:** Inline field errors; a duplicate number shows *"This invoice number already
  exists."*
- **Success state:** A toast: *"Invoice issued."*
- **Navigation destinations:** A-02.
- **Required components:** `Input`, `Select`, `MultiSelect`, `DateField`, `Button`, `Toast`.
- **Accessibility:** The default amount is announced when the field receives focus.
- **Labels:**

| English | Français |
|---|---|
| New invoice | Nouvelle facture |
| Invoice number | Numéro de facture |
| Billable needs | Besoins facturables |
| Amount | Montant |
| Issue date | Date d'émission |
| Due date (optional) | Date d'échéance (facultatif) |
| Issue the invoice | Émettre la facture |
| Invoice issued. | Facture émise. |
| This invoice number already exists. | Ce numéro de facture existe déjà. |

---

### A-06 — Payment verification

- **Purpose:** Let the administrator confirm or reject a declared payment.
- **Target user:** Administrator.
- **Entry point:** A-02 → "Verify the payment" → a pending payment.
- **Primary action:** "Confirm the payment".
- **Secondary actions:** "Reject" (opens a sheet with a required reason); back.
- **Content:** The declared details (transaction ID, payer phone, declared amount, operator, date,
  evidence); the **invoice amount** and the difference, side by side; a duplicate warning if the
  transaction ID appears on another payment; the extra pre-assignment checks (payment verified,
  contract signed, a tutor assigned to every need, and the labelled placeholder operational check);
  a notice that this prototype performs no real operator verification.
- **Validation:** A rejection requires a reason. Confirmation requires all the pre-assignment checks.
- **Loading state:** The confirm button shows a spinner.
- **Empty state:** n/a.
- **Error state:** Inline errors; a failed confirmation shows a toast.
- **Success state:** A toast: *"Payment confirmed. The receipt has been issued."* / *"Payment
  rejected. The client has been notified."*
- **Navigation destinations:** A-02; A-07.
- **Required components:** `Card`, `KeyValue`, `Button`, `Sheet`, `Checkbox`, `Toast`, `Alert`.
- **Accessibility:** The amount comparison is a labelled table-like group so the difference is
  announced. The duplicate warning is a role="alert" region.
- **Labels:**

| English | Français |
|---|---|
| Verify the payment | Vérifier le paiement |
| Declared by the client | Déclaré par le client |
| Transaction ID | ID de transaction |
| Payer's phone | Numéro du payeur |
| Declared amount | Montant déclaré |
| Operator | Opérateur |
| Payment date | Date du paiement |
| Invoice amount | Montant de la facture |
| Difference | Écart |
| This transaction ID was already used for another payment. | Cet ID de transaction a déjà été utilisé pour un autre paiement. |
| Checks before assigning a tutor | Vérifications avant attribution |
| Payment verified | Paiement vérifié |
| Contract signed | Contrat signé |
| A tutor is assigned to every need | Un précepteur est attribué à chaque besoin |
| Operational check (to be defined) | Vérification opérationnelle (à définir) |
| Confirm the payment | Confirmer le paiement |
| Reject | Rejeter |
| Reason for rejection | Motif du rejet |
| Payment confirmed. The receipt has been issued. | Paiement confirmé. Le reçu a été émis. |
| Payment rejected. The client has been notified. | Paiement rejeté. Le client a été prévenu. |
| Demo only: this prototype cannot contact the Mobile Money operator. | Démo uniquement : ce prototype ne peut pas contacter l'opérateur Mobile Money. |

---

### A-07 — Receipt issuance

- **Purpose:** Show the receipt generated by a confirmed payment and allow it to be shared.
- **Target user:** Administrator.
- **Entry point:** A-06 after a confirmation, or A-02 → the receipt in the documents list.
- **Primary action:** "Copy the receipt number".
- **Secondary actions:** Back.
- **Content:** The receipt number, the amount, the issue date, the invoice reference, the verified
  transaction ID.
- **Validation:** n/a.
- **Loading state:** A skeleton body.
- **Empty state:** n/a.
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** A toast on copy.
- **Navigation destinations:** A-02.
- **Required components:** `Card`, `KeyValue`, `Button`, `Toast`.
- **Accessibility:** Same as W-17.
- **Labels:**

| English | Français |
|---|---|
| Receipt | Reçu |
| Receipt number | Numéro de reçu |
| Copy the receipt number | Copier le numéro de reçu |

---

### A-08 — Tutor assignment

- **Purpose:** Assign a tutor to each need of a request.
- **Target user:** Administrator.
- **Entry point:** A-02 → "Assign a tutor".
- **Primary action:** "Assign" per need.
- **Secondary actions:** "Change the tutor" on an existing assignment; "Cancel the assignment"; back.
- **Content:** The request's needs, each with the current assignment (or "not assigned"); the
  candidate tutors filtered by subject and format, with the ineligible ones disabled and the reason
  given; the tutor preference reminder; the assigned-tutor summary.
- **Validation:** The tutor must be active and support the need's subject and format; a need may not
  have two active assignments.
- **Loading state:** The assign button shows a spinner.
- **Empty state:** If the catalogue has no eligible tutor for a need: *"No available tutor covers
  this need. Add one to the catalogue."*
- **Error state:** Inline errors on the assign action.
- **Success state:** A toast: *"Tutor assigned."*
- **Navigation destinations:** A-02.
- **Required components:** `Card`, `ListItem`, `Select`, `Button`, `Toast`, `Alert`.
- **Accessibility:** Ineligible tutors are disabled with an explanation. The assignment summary is a
  list keyed by need.
- **Labels:**

| English | Français |
|---|---|
| Tutor assignment | Attribution des précepteurs |
| Needs | Besoins |
| Assigned tutor | Précepteur attribué |
| Not assigned | Non attribué |
| Candidate tutors | Précepteurs disponibles |
| Assign | Attribuer |
| Change the tutor | Changer de précepteur |
| Cancel the assignment | Annuler l'attribution |
| Tutor assigned. | Précepteur attribué. |
| No available tutor covers this need. | Aucun précepteur disponible pour ce besoin. |
| The client prefers the same tutor where possible. | Le client préfère le même précepteur si possible. |

---

### A-09 — Activity history

- **Purpose:** Show the complete audit trail of a request.
- **Target user:** Administrator.
- **Entry point:** A-02 → "Activity history".
- **Primary action:** None (read-only).
- **Secondary actions:** Back.
- **Content:** A reverse-chronological list of events: the actor (client, administration, system),
  the action, the previous and the new status, the timestamp, and any note.
- **Validation:** n/a.
- **Loading state:** A skeleton list.
- **Empty state:** *"No activity yet."*
- **Error state:** An `ErrorState` with a "Try again" action.
- **Success state:** n/a.
- **Navigation destinations:** A-02.
- **Required components:** `ListItem`, `Badge`, `EmptyState`.
- **Accessibility:** Each event announces the actor, the action and the time.
- **Labels:**

| English | Français |
|---|---|
| Activity history | Historique d'activité |
| No activity yet | Aucune activité pour l'instant |
| Client | Client |
| Administration | Administration |
| System | Système |

---

## 6. Bottom Sheets

| Sheet | Trigger | Content | Primary action | Dismissal |
|---|---|---|---|---|
| Request type | "Get Started" | Two options | Choose | Swipe / back |
| Child form | "Add a child" | The child fields | Save | Swipe / back |
| Need form | "Add a need" | The need fields | Save | Swipe / back |
| Language | The FR/EN control (not used on Welcome: the control switches the copy directly) | A short list | Choose | Swipe / back |
| Continue request | Welcome, when a draft exists | A summary + a choice | Continue | Swipe / back |
| Rejection reason | "Decline" | An optional textarea | Confirm | Swipe / back |
| Signature | "Sign the contract" | The typed name | Sign | Swipe / back |
| Rejection reason (admin) | "Reject" | A required reason | Confirm | Swipe / back |
| Select | Any select field | A radio list | Choose | Swipe / back |

**Sheet rules:** a title is always present; the primary action is pinned at the bottom; the sheet
grows with the keyboard but never beyond the screen height; the sheet is scrollable only when its
content genuinely overflows; a sheet is never used for a decision that needs more than one screen.

---

## 7. Dialogs

Dialogs are reserved for **destructive or irreversible** actions.

| Dialog | Trigger | Content | Actions |
|---|---|---|---|
| Remove a child | The child's overflow → "Remove" | The child's name and the consequence | Remove (destructive) / Cancel |
| Cancel the request | Where a cancellation is offered | The consequence | Cancel the request (destructive) / Keep the request |

Everything else uses a **sheet** (secondary choice) or a **toast** (feedback).

---

## 8. Feedback Catalogue

| Situation | Component | Copy (EN / FR) |
|---|---|---|
| Success of a non-blocking action | Toast | *"Child added."* / « Enfant ajouté. » |
| Failure of a non-blocking action | Toast (error) | *"The code could not be saved. Try again."* / « Le code n'a pas pu être enregistré. Réessayez. » |
| Field validation | Inline text under the field | See §11 |
| Form-level failure | `ErrorState` above the button | *"Something went wrong. Try again."* / « Une erreur est survenue. Réessayez. » |
| Blocking load | Skeleton | — |
| Destructive confirmation | Dialog | See §7 |
| Simulated boundary | Inline notice card | See §9 |

---

## 9. Simulation Notices (Mandatory Copy)

These notices appear wherever a real-world action is being simulated. They must not be removed
without replacing the underlying behaviour with a real integration.

| Where | English | Français |
|---|---|---|
| PIN creation | "Demo only: this code is stored on your device in a hashed form. It is not real authentication." | « Démo uniquement : ce code est enregistré sur votre appareil sous forme hachée. Ce n'est pas une authentification réelle. » |
| Contract signature | "Demo only: this wording is a placeholder and this signature is a demonstration. It is not a legally binding electronic signature." | « Démo uniquement : ce texte est un modèle et cette signature est une démonstration. Il ne s'agit pas d'une signature électronique juridiquement contraignante. » |
| Payment declaration | "Demo only: this prototype does not contact any Mobile Money operator." | « Démo uniquement : ce prototype ne contacte aucun opérateur Mobile Money. » |
| Payment verification (admin) | "Demo only: this prototype cannot contact the Mobile Money operator." | « Démo uniquement : ce prototype ne peut pas contacter l'opérateur Mobile Money. » |
| Notifications | "Demo only: notifications are delivered inside the app. No SMS or WhatsApp message is sent." | « Démo uniquement : les notifications sont délivrées dans l'application. Aucun SMS ni message WhatsApp n'est envoyé. » |
| Admin workspace | "Simulation — this workspace is a local demonstration with no authentication." | « Simulation — cet espace de travail est une démonstration locale, sans authentification. » |

---

## 10. Status Presentation

| Entity | Statuses shown to the client | Presentation |
|---|---|---|
| Request | Received, Under review, Proposal sent, Proposal accepted, Proposal declined, Contract signed, Awaiting payment, Payment verified, In service, Completed, On hold, Cancelled | `Badge` + a plain-language next step |
| Proposal | Draft, Sent, Accepted, Declined, Withdrawn | `Badge` |
| Contract | Draft, Issued, Signed, Active, Void | `Badge` + the sign action when applicable |
| Invoice | Draft, Awaiting payment, Paid, Cancelled | `Badge` |
| Payment | Awaiting verification, Confirmed, Rejected, Duplicate | `Badge` + the detail rows |
| Assignment | Proposed, Assigned, Active, Completed, Cancelled | `Badge` on the tutor card |

**Presentation rules:**
- The internal status key is never displayed; only the translated label.
- A status is always a badge **with a text label**, never a coloured dot alone.
- The timeline shows the phases reached, with the current phase highlighted.

---

## 11. Validation Message Reference (FR primary)

| Key | English | Français |
|---|---|---|
| `validation.child.firstName` | First name is required | Le prénom est requis |
| `validation.child.lastName` | Last name is too long | Le nom est trop long |
| `validation.child.birthDate` | Enter a valid date of birth | Saisissez une date de naissance valide |
| `validation.child.age` | The age must be between 3 and 25 | L'âge doit être compris entre 3 et 25 ans |
| `validation.child.level` | The school level is required | Le niveau scolaire est requis |
| `validation.child.school` | The school name is too long | Le nom de l'école est trop long |
| `validation.need.subject` | Enter the subject or skill | Indiquez la matière ou la compétence |
| `validation.need.level` | Enter the current level | Indiquez le niveau actuel |
| `validation.need.objective` | Describe the learning objective | Décrivez l'objectif d'apprentissage |
| `validation.need.frequency` | Choose the frequency | Choisissez la fréquence |
| `validation.need.sessionMinutes` | Choose the session length | Choisissez la durée de la séance |
| `validation.need.availability` | Indicate your availability | Indiquez vos disponibilités |
| `validation.need.format` | Choose the preferred format | Choisissez le format préféré |
| `validation.need.location` | Enter the location | Indiquez la localisation |
| `validation.contact.firstName` | First name is required | Le prénom est requis |
| `validation.contact.lastName` | Last name is required | Le nom est requis |
| `validation.contact.phone` | Enter a valid phone number | Saisissez un numéro de téléphone valide |
| `validation.contact.email` | Enter a valid email address | Saisissez une adresse e-mail valide |
| `validation.pin.format` | The code must be 4 digits | Le code doit contenir 4 chiffres |
| `validation.pin.mismatch` | The codes do not match | Les codes ne correspondent pas |
| `validation.payment.transactionId` | Enter a valid transaction ID | Saisissez un ID de transaction valide |
| `validation.payment.payerPhone` | Enter a valid phone number | Saisissez un numéro de téléphone valide |
| `validation.payment.amountMismatch` | The declared amount does not match the invoice amount | Le montant déclaré ne correspond pas au montant de la facture |
| `validation.payment.operator` | Choose the operator | Choisissez l'opérateur |
| `validation.payment.paidAt` | Enter a valid payment date | Saisissez une date de paiement valide |

---

## 12. Feedback & Error Messages (System Level)

| Key | English | Français |
|---|---|---|
| `error.network` | No connection. Try again. | Aucune connexion. Réessayez. |
| `error.storage` | We could not save your changes. They may be lost. | Nous n'avons pas pu enregistrer vos modifications. Elles peuvent être perdues. |
| `error.restored` | Some information could not be restored. | Certaines informations n'ont pas pu être restaurées. |
| `error.unknown` | Something went wrong. Try again. | Une erreur est survenue. Réessayez. |
| `error.notFound` | We could not find this information. | Nous n'avons pas trouvé cette information. |
| `error.notFoundTitle` | Not found | Introuvable |

### 12.1 The not-found state

- **When:** an unknown route, or a route whose dynamic id does not exist or is malformed (an id
  whose prefix does not match the entity, e.g. `/proposal/xyz`).
- **It is a full-screen state**, never a toast and never a blank screen.
- **Content:** a title, one explanatory sentence and a single action.
- **Action:** returns to the dashboard for a screen reached from the client journey; returns to the
  Welcome screen for an unknown route. The action is a replacement, not a new step in the stack.
- **The screen keeps the header of the stack it belongs to** (the administrator sees the admin
  header).
- **Accessibility:** the block is announced as an alert; the title is the only heading.
- **Labels:**

| English | Français |
|---|---|
| Not found | Introuvable |
| We could not find this information. | Nous n'avons pas trouvé cette information. |
| Back to the dashboard | Retour au tableau de bord |
| Back home | Retour à l'accueil |

### 12.2 Common labels used by the navigation shell

| Key | English | Français |
|---|---|---|
| `common.backHome` | Back home | Retour à l'accueil |
| `common.backToDashboard` | Back to the dashboard | Retour au tableau de bord |
| `admin.simulation.title` | Administration (simulation) | Administration (simulation) |
| `admin.simulation.banner` | Simulation — this workspace is a local demonstration with no authentication. | Simulation — cet espace de travail est une démonstration locale, sans authentification. |

---

## 13. Screen Relationship Map

```
                    ┌──────────────┐
                    │   W-01       │
                    │  Welcome     │
                    └───┬───┬──┬───┘
                        │   │  │
              W-02 ─────┘   │  └──── A-01 ──── A-02 ─┬─ A-03
             (sheet)         │                         ├─ A-04
          ┌──────────┬──────┘                         ├─ A-05
          ▼          ▼                                ├─ A-06 ── A-07
      W-03        W-07                                ├─ A-08
      Children    Adult needs                         └─ A-09
          │          │
          ▼          ▼
      W-05        W-07
      Needs       Needs
          │          │
          └────┬─────┘
               ▼
          W-08 Contact
               ▼
          W-09 PIN
               ▼
          W-10 Review
               ▼
          W-11 Submitted
               ▼
          W-12 Dashboard ──┬─ W-13 Proposal
                            ├─ W-14 Contract
                            ├─ W-15 Invoice ── W-16 Payment
                            │                    │
                            │                    ▼
                            │              W-17 Receipt
                            ├─ W-18 Tutor
                            └─ W-19 Notifications
```

---

## 14. Known Gaps in This Specification

| Gap | Note |
|---|---|
| No final logo | Closed in S05 — `assets/mon-precepteur-logo.png` is the brand lock-up (see R-14) |
| No illustration assets | Empty states are icon-only |
| The admin namespace is FR-only | See R-15 |
| The "Operational check (to be defined)" placeholder | See R-06 — the real rule is required before production |
| No screen for multiple requests in detail | The dashboard lists them; a dedicated list screen may be added later |
| No screen for the tutor's own view | Out of scope for the prototype |
| Motion timings are not specified per screen | Defined globally in `context/ui-context.md` §6.5 |
