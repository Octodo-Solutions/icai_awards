# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

There is also an [AGENTS.md](AGENTS.md) with overlapping guidance (design system, data model, common tasks) — read it too. This file focuses on the big-picture architecture and the non-obvious gotchas.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # Production build to dist/
npm run lint     # ESLint (flat config)
npm run preview  # Serve the production build
```

There is no test suite and no test runner configured. `npm run lint` is the only automated check.

## What this is

`icai-awards` is a **single-page, front-end-only interactive prototype** of the ICAI Sustainability Awards nomination portal. React 19 + Vite 8, JavaScript/JSX (no TypeScript). It exists to demo the UX; it mirrors an intended Next.js + PostgreSQL production build that does not live here. There is **no backend, no router, no persistence** — all data is hardcoded seed constants and all "navigation" is `useState` in the root component.

## Architecture

Essentially the entire app is one file: [src/App.jsx](src/App.jsx) (~1300 lines). [src/main.jsx](src/main.jsx) just mounts `<App>` in `StrictMode`.

**Routing is state, not URLs.** The root `App()` component (bottom of the file) holds the state that decides what renders:
- `route` — `"site"` | `"login"` | `"app"` (only meaningful when logged out)
- `session` — `null` or `{ role, name, email }`; `role` is `"member"` or `"admin"`
- `screen` — `"dash"` | `"wizard"` (member-only sub-navigation)
- `categories` — the editable award-category list, lifted here because both `PublicSite` and `AdminConsole` read/write it
- `noms` — the shared nomination list (see "The loop" below)
- `viewNom` — the nomination currently shown in the full-data preview modal (`NominationModal`)

The render tree is a flat chain of `&&` conditionals at the end of `App()`. To change what shows up, edit those conditions — there is no route table.

**The loop (important).** `noms` is the single source of truth shared by the member and admin sides — this is what makes the demo feel real. Each nomination has an `owner` (member email); `ApplicantPortal` sees `noms.filter(n => n.owner === session.email)`, `AdminConsole` sees all of `noms`. Three handlers in `App()` drive the round-trip: `addNom` (wizard final-submit prepends a nomination → it appears in the admin console), `raiseClarification` (admin flags a nomination `Clarification Required` + attaches a `clarification` thread → member sees it), and `respondClarification` (member replies → status flips to `Under Review`). When editing a nomination detail in admin, read the **live** record via `noms.find(...)` (`selLive`), not the row snapshot, or status changes won't reflect.

**Top-level screens**, each a component in the same file:
- `PublicSite` — marketing/landing page (hero, countdown, categories, eligibility, submission guidelines, nomination process, dates, winners, FAQ)
- `LoginScreen` — role toggle (member/admin) with `login` → `otp` → dashboard, plus `register` and `forgot` steps. Credentials are checked against `DEMO`; the OTP and reset flows are demo stubs (any 6 digits pass).
- `ApplicantPortal` — member dashboard; `View` opens `NominationModal`, `Respond` opens `RespondModal`
- `NominationWizard` — 5-step flow (`Company → Classification → Contacts → Documents → Declaration`). Inputs are **controlled** via one `data` object; documents live in a lifted `docs` state (Upload/Replace/drag-drop mutate it). Mandatory-doc completeness is shown as a checkmark on the Declaration step but does **not** block submission (deliberate, for the demo).
- `AdminConsole` — sidebar app with `dashboard`/`nominations`/`categories`/`clarify`/`comms` views; category CRUD with a usage-aware delete modal, and `ClarifyModal` for raising clarifications

**Shared modals** live near the components that open them: `NominationModal` (full captured data; `window.print()` for download), `RespondModal`, `ClarifyModal`.

**Module-level constants** near the top drive everything: `C` (color palette), `STATUS` (the nomination status enum with per-status colors), `SEED` (nomination rows — each with `owner`/`contacts`/optional `clarification`), `SEED_CATEGORIES`, `INITIAL_DOCS`, and `DEMO` (login credentials). Change data here, not in the components.

**Shared primitives** (`Pill`, `Btn`, `Card`, `Eyebrow`, `Field`, `SectionLabel`, plus `inputCls`/`inputStyle`) are defined once and reused. Prefer them over ad-hoc markup so styling stays consistent.

## Styling & design system ("editorial institutional")

Two layers, used together:
- **Tailwind v4** provides layout and most utility styling via class names. Wired through the `@tailwindcss/vite` plugin in [vite.config.js](vite.config.js) and `@import "tailwindcss";` in [src/index.css](src/index.css). **No `tailwind.config.js`, no PostCSS config** — v4 is zero-config; don't add those files unless deliberately extending the theme.
- **Inline `style={{...}}` props** supply the brand colors, referencing the `C` palette constant. Colors live here, not in Tailwind classes.

The visual language is **editorial institutional** (annual-report feel), deliberately not the generic rounded-card look:
- **Typography:** Fraunces (variable serif) for display headlines via the `.ff-display` class (redefined in `useFonts()`); Hanken Grotesk for body (`.ff-sans`); IBM Plex Mono for uppercase micro-labels (`.lbl`) and data. Serif headings use `C.inkSerif`. Adding a heading? Use `.ff-display` — it's serif app-wide.
- **Rules over boxes:** hairline dividers (`C.hairline`, `C.hairDark` on the dark band) replace card borders/boxed lists wherever possible. Callouts/threads use a 2px status-colored `borderLeft`, not tinted boxes.
- **Radius mix (deliberate):** action buttons `rounded-[3px]`, inputs/panels `rounded-[4px]`, cards `rounded-lg`, `Pill` status chips and avatars fully round. Don't homogenize.
- **Editorial utilities** in [src/index.css](src/index.css): `.num-ghost`/`.num-ghost-light` (oversized outlined numerals, e.g. hero "2026"), `.bg-grain`/`.bg-grain-light` (dot-grid textures), `.link-edit` (underline links), `.reveal`/`.reveal-d1..3` (scroll-reveal states), plus `:focus-visible` and a `prefers-reduced-motion` kill-switch.
- **Front page rhythm:** full-bleed **deep-evergreen hero** (`C.deep` + layered radial leaf washes + light grain; `cream`/`light` Btn variants, `<Countdown light />`), then a white **stats strip**, then **alternating section bands** — off-white → white (`border-y bg-white` wrappers: categories, process, FAQ) → the dark dates band. Keep the alternation when adding sections; don't put two same-background bands adjacent.
- **Shared editorial primitives** (module level in App.jsx): `SectionHead` (numbered public sections 01–07), `NumberedList`, `PageTitle` (admin view headers), `StatTab`/`StatCard` (count-up stats — hoisted because they call the `useCountUp` hook), `ChoiceChip`, and `AwardMark` (the SVG laurel-roundel 2026 award emblem; `light` prop for dark surfaces — used in the hero and login brand panel).
- **Motion:** `useReveal()`/`Reveal` (IntersectionObserver, fire-once) for public-section reveals; `useCountUp()` (rAF ease-out) for stat numbers. Both respect reduced motion. CSS-only otherwise — no animation libraries.
- **`.lbl` uppercases via CSS** — `innerText`-based tests must match case-insensitively.

## Assets

Static files live in [public/](public/) and are served from the site root — e.g. the ICAI brand logo `public/logo-icai1.png` is referenced as `/logo-icai1.png`. The header and the login brand panel use it; role/decorative marks elsewhere still use `lucide-react` icons (`Leaf`, `Shield`).

## Conventions

- JavaScript + JSX only — do not introduce TypeScript unless asked.
- Icons from `lucide-react`; charts from `recharts`. Follow existing usage in the file.
- **React Compiler is intentionally disabled** in [vite.config.js](vite.config.js). It hoisted property reads on nullable state (e.g. `editing.active` while `editing` is `null`) into per-render memo guards, which crashed `AdminConsole` on mount (blank page). It's only an optimization — do not re-enable it without confirming that class of crash is gone.
- Do **not** define a component inside another component's render (e.g. a helper that returns JSX). ESLint/React flags it and it resets state each render — use a mapped array or a module-level component instead.
- All state is in-memory: a page reload resets `noms`, drafts, and any clarifications back to `SEED`. Fine for the demo; call it out if a stakeholder expects persistence.
- Keep the palette cool and restrained (see `C` and AGENTS.md): no warm creams, no acid greens; `honey` is reserved for winners.
- Dates, credentials, and figures are demo placeholders — the countdown targets `2026-08-15`.
