# ICAI Awards Nomination Portal — AI Agent Instructions

## Project Overview

**icai-awards** is an interactive React + Vite prototype for the ICAI Sustainability Awards nomination portal. It manages company nominations with various submission statuses and tracks supporting documentation.

See [README.md](README.md) for tech stack details.

## Quick Start Commands

```bash
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture & Key Files

- **[src/App.jsx](src/App.jsx)** — Single-file React component with:
  - Color palette definition (`const C = {...}`)
  - Status enum (`const STATUS = {...}`)
  - Seed data for nominations
  - UI components for nomination management, filtering, charting
- **[src/main.jsx](src/main.jsx)** — React app entry point
- **[vite.config.js](vite.config.js)** — Vite + React compiler plugin setup
- **[eslint.config.js](eslint.config.js)** — Flat ESLint config (React hooks, refresh)

## Project Conventions

### Design System — "editorial institutional"

The app uses a restrained, green-forward color palette defined in `App.jsx`:

```javascript
const C = {
  bg: "#f5f7f2",        // soft off-white background
  green: "#1e4a37",     // primary evergreen
  leaf: "#548a63",      // living accent (use sparingly)
  honey: "#b28a4c",     // warm accent (winners only)
  hairline: "#d8dfd2",  // editorial rule lines
  inkSerif: "#10201a",  // serif headline ink
  // ... see App.jsx for full palette
};
```

**Key principles:**
- Minimal, cool tones. No warm cream backgrounds, no acid green.
- Annual-report typography: Fraunces serif display headlines (`.ff-display`), Hanken Grotesk body, IBM Plex Mono uppercase micro-labels (`.lbl`).
- Hairline rules and numbered sections instead of boxed card grids; 2px left rules instead of tinted callout boxes.
- Deliberate radius mix: rectangular buttons (`rounded-[3px]`), slightly rounded cards (`rounded-lg`), fully round status `Pill`s.
- Subtle CSS-only motion: `Reveal` scroll fades, `useCountUp` stat counters — both respect `prefers-reduced-motion`.

### Component Structure

- Functional components with React Hooks
- No TypeScript (JavaScript + JSX)
- Icons from [lucide-react](https://lucide.dev) — used sparingly and deliberately
- Charts from [recharts](https://recharts.org) — mono axis/tooltip type, thin pie ring, square legend swatches
- Tailwind v4 utility classes for layout + inline `style={{...}}` props for brand colors (no CSS modules)
- Editorial primitives in App.jsx: `SectionHead`, `NumberedList`, `PageTitle`, `StatTab`/`StatCard`, `ChoiceChip` — reuse these rather than ad-hoc markup

### Nomination Data Model

Each nomination object contains:
```javascript
{
  id: "NOM-2026-0001",
  company: "Company Name",
  email: "contact@company.in",
  listing: "NSE Listed" | "BSE Listed" | "Unlisted",
  cap: "Large Cap" | "Mid Cap" | "Small Cap" | "Voluntary",
  sector: "Manufacturing" | "Service",
  category: "Large Cap · Manufacturing", // composite key
  status: "Draft" | "Submitted" | "Under Review" | "Clarification Required" | "Final Submitted",
  submitted: "DD Mon YYYY",
  docs: <number>
}
```

### Status Enum

Status colors and styles are centralized in `const STATUS = {...}` in App.jsx. Each status has:
- `c` — text color
- `bg` — background color
- `label` — display name

## Common Tasks

### Adding a New Status or Category

1. Update the `STATUS` object in App.jsx (color + label)
2. Update the `category` or `listing`/`cap`/`sector` values in SEED data
3. Run `npm run lint` to check

### Modifying the Color Palette

Edit the `C` object in App.jsx. Keep colors cool and restrained; avoid warm creams and acid greens.

### Adding Icons

Import from lucide-react at the top of App.jsx. See the existing imports for examples.

### Adding Charts

Use recharts (`BarChart`, `PieChart`, etc.). Follow the existing chart patterns in App.jsx.

## Development Notes

- **React Compiler enabled:** May impact dev & build performance. See [React Compiler docs](https://react.dev/learn/react-compiler).
- **ESLint:** Uses flat config with React Hooks plugin. Check violations with `npm run lint`.
- **HMR:** Vite dev server has hot module replacement enabled.
- **No TypeScript:** This is a JavaScript project. Do not add TypeScript unless explicitly requested.

## When to Ask for Clarification

- Specific behavior for nomination workflows (e.g., state transitions, permissions)
- Data validation or import/export requirements
- Backend API integration (currently using placeholder seed data)
- Deployment target or environment specifics
