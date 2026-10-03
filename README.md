# Technical Plate & Editorial Folio — DevOps Portfolio

A React + Tailwind CSS v4 rebuild of the *stitch_editorial_devops_portfolio* design, rebuilt as a
modern component application with an advanced (but restrained) motion system.

**Design language:** ink on warm, unbleached cotton rag paper — an archival editorial system of
hairline rules, stamped specimen plates, ledger metadata, and monospaced data readouts. Every
corner is square; depth comes from planar contrast and unblurred `3px` offset stamps rather than
blur shadows.

## Stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Build      | Vite 7 + React 19 + TypeScript (strict)          |
| Styling    | Tailwind CSS v4 (`@theme` design tokens)         |
| Motion     | Framer Motion 12 (scroll reveals, springs, tilt) |
| Icons      | lucide-react + inline brand marks                |
| Type       | Playfair Display · Inter · JetBrains Mono        |

## Case-study dossier (new)

The **CloudPath FocusFlow** card is flagged `NEW` and opens a popup dossier from its
**Open case study** button — a scrollable, ESC-dismissible modal containing:

1. **Overview** — what the project is, what it proves, and a facts ledger.
2. **Technology stack** — six grouped chip blocks (source, security, containers, k8s, IaC, app).
3. **Delivery architecture — animated** — a blueprint figure whose ten rows walk
   pending → in-flight → verified while pulses travel the dashed connectors (pauses off-screen).
4. **Repository structure, briefly** — every top-level folder/file with a one-line explanation.
5. **Command prompt — examples** — five tabs (Quick start · Docker · Kubernetes · Terraform · AWS·ECR)
   in a terminal that staggers each line in, with a working **Copy** button and blinking caret.
6. **Security & cost notes** — secret-handling rules and the cost-control decisions.


## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle → dist/
npm run preview    # serve the production build on :4173
```

## Motion inventory

- **Masthead** — scroll-progress hairline, `layoutId` active-section underline, slide-in mobile drawer.
- **Metric ticker** — infinite marquee of live delivery metrics.
- **Hero** — staggered entrance choreography, looping typewriter with blinking caret, blueprint
  grid feathered by a radial mask, and a lanyard ID pass that sways on its strap and tilts to the
  pointer (spring-damped) with a portrait fallback plate.
- **Sections** — viewport-triggered rises, staggered children, hairline rules that draw themselves.
- **Sparkline** — SVG `pathLength` draw-on.
- **Pipeline topology** — self-running CI/CD rail: stages flip pending → active → verified while a
  travelling pulse crosses each gutter and a terminal log types itself out; pauses when off screen.
- **Projects** — count-up ledger metrics, stamped offset-shadow hover.
- **Contact** — sharp checkbox stamps, and a form that resolves into a rotated "transmission
  received" stamp.
- **Plate rail** — fixed left-margin ledger showing the running plate index and scroll percentage.
- All motion respects `prefers-reduced-motion`.

## Scripts

```bash
node scripts/shoot.mjs   # section screenshots → shots/ (drives installed Chrome)
node scripts/audit.mjs   # console errors, horizontal overflow, font check at 4 breakpoints
```

## Structure

```
src/
  App.tsx                 composition shell
  index.css               Tailwind v4 @theme tokens, base, components, keyframes
  data/portfolio.ts       all content (nav, metrics, skills, pipeline, projects, contact)
  data/focusflow.ts       case-study dossier content (diagram rows, tree, commands)
  lib/hooks.ts            useTypewriter · useActiveSection · useCountUp · useSectionInView
  components/             Nav · MetricStrip · Hero · IdPass · Skills · Pipeline ·
                          Projects · CaseStudyModal · ArchitectureFlow · CommandDeck ·
                          Contact · Footer · PlateRail · SectionHeader · Reveal
```

## Verification scripts

```bash
node scripts/audit.mjs        # page: console, overflow, fonts @ 4 breakpoints
node scripts/audit-case.mjs   # modal: overflow + console with the dossier open
node scripts/linkcheck.mjs    # every rendered href resolves (no relative links)
node scripts/shoot.mjs        # section screenshots → shots/
node scripts/shoot-case.mjs   # dossier screenshots (desktop + mobile)
node scripts/verify-deck.mjs  # command-deck tabs + clipboard assertions
```
