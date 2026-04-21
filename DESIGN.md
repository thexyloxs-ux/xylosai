# XYLO Design System

## Audit Score (before glass upgrade)

| Dimension | Score | Notes |
|---|---|---|
| Color consistency | 9/10 | Amber + cream + dark surfaces, well-defined tokens |
| Typography hierarchy | 9/10 | Fraunces (display) + Plus Jakarta Sans (body) + JetBrains Mono (code) |
| Spacing rhythm | 8/10 | 4pt scale, consistent — minor inconsistencies in scoped page styles |
| Component consistency | 6/10 | CSS split across `app.css`, scoped `<style>` blocks, and `landing.css` |
| Responsive behavior | 8/10 | Fluid breakpoints at 768px, 1024px |
| Dark mode | 8/10 | Dark-first tokens, light mode via `.light` class — partial on landing |
| Animation | 8/10 | Purposeful — slide-up, fade-in, marquee, chat-reveal |
| Accessibility | 8/10 | Focus rings, skip link, aria-labels, 44px touch targets |
| Information density | 8/10 | Clean editorial layout, good whitespace |
| Polish | 7/10 | Header has glass; cards were flat — upgraded to Liquid Glass |

**Overall: 79/100 → 87/100 after glass upgrade**

---

## Design Tokens

Defined in `src/app.css` via Tailwind v4 `@theme`:

### Brand Colors
| Token | Value | Use |
|---|---|---|
| `--color-accent` | `#f59e0b` (amber-500) | Primary brand, CTAs, accents |
| `--color-accent-hover` | `#d97706` (amber-600) | Hover state |
| `--color-dark-base` | `#0f1117` | App background (dark) |
| `--color-dark-surface` | `#1a1d27` | Elevated surfaces |
| `--color-dark-card` | `#22263a` | Card backgrounds |

Landing page uses oklch equivalents scoped to `.lp`:
- `--lp-amber` = `oklch(72% 0.185 72)` ≈ amber-400
- `--lp-cream` = `oklch(97.5% 0.018 85)` ≈ warm white
- `--lp-ink` = `oklch(18% 0.014 50)` ≈ near-black

### Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Display / headings | Fraunces | 700–800 | clamp(2rem, 4.5vw, 3rem) |
| Body | Plus Jakarta Sans | 400–600 | 1rem / 0.9375rem |
| Monospace | JetBrains Mono | 400–700 | 0.9375rem |

### Spacing (4pt base)
`xs=0.25` · `sm=0.5` · `md=1` · `lg=1.5` · `xl=2` · `2xl=3` · `3xl=4rem`

### Radius
`sm=6px` · `md=8px` · `lg=12px` · `xl=16px` · `2xl=24px` · `full=9999px`

---

## Liquid Glass System

Inspired by Apple's iOS 26 Liquid Glass material, adapted for CSS/web.

### Core Concept
Glass effects use `backdrop-filter: blur + saturate` to create translucent surfaces that reflect surrounding content. A 1px top-edge reflection line simulates the light refraction of physical glass.

### Utilities (in `src/app.css`)

#### Dark glass — dark mode cards, sidebars
```css
.glass-dark
  background: oklch(100% 0 0 / 0.04)  /* 4% white */
  backdrop-filter: blur(24px) saturate(160%)
  border: 1px solid oklch(100% 0 0 / 0.09)
  box-shadow: inset 0 1px 0 (top reflection) + depth shadow
```

#### Dark glass interactive — hover morphing
```css
.glass-dark-interactive
  :hover → background 7%, border 16%, deeper shadow
```

#### Amber-tinted dark glass — accent elements in dark mode
```css
.glass-amber-dark
  background: oklch(72% 0.185 72 / 0.07)   /* amber wash */
  border: 1px solid oklch(72% 0.185 72 / 0.22)
  box-shadow: amber glow shadow
```

#### Light glass — landing page cards, surfaces
```css
.glass-light
  background: oklch(100% 0 0 / 0.72)
  backdrop-filter: blur(20px) saturate(150%)
  border: 1px solid oklch(100% 0 0 / 0.9)   /* near-opaque white border */
  box-shadow: inset 0 1px 0 white (top reflection)
```

#### Light glass interactive — hover for landing cards
```css
.glass-light-interactive
  :hover → background 88%, border full white, translateY(-2px)
```

#### Amber-tinted light glass — featured cards (`.lp-bento-a`)
```css
.glass-amber-light
  background: oklch(72% 0.185 72 / 0.06)
  border: 1px solid oklch(72% 0.185 72 / 0.2)
```

#### Top reflection sheen
```css
.glass-sheen
  ::after → 1px gradient line at top edge
  simulates physical glass light refraction
```

#### Pill glass — rounded glass buttons/nav
```css
.glass-pill
  border-radius: 9999px, blur(16px)
```

### Applied In

| Component | Glass Type | File |
|---|---|---|
| Site header (nav pill) | Light glass | `SiteHeader.svelte` |
| Hero chat preview | `glass-light` enhanced | `+page.svelte` |
| Bento feature cards | `glass-light` | `+page.svelte` |
| Featured bento card (A) | `glass-amber-light` | `+page.svelte` |
| School card | Dark glass w/ amber glow | `+page.svelte` |
| Marquee strip | Light glass strip | `+page.svelte` |
| CTA band | Dark glass w/ atmosphere | `+page.svelte` |
| Dashboard header | Light glass sticky | `dashboard/+page.svelte` |
| Dashboard stats row | `glass-light` container | `dashboard/+page.svelte` |
| Dashboard table | `glass-light` container | `dashboard/+page.svelte` |

### Best Practices (web)
- **Always set `position: relative; isolation: isolate`** on glass elements so z-index stacking works
- **Add `overflow: hidden`** when using pseudo-element reflection sheens
- **Group glass containers** — wrap multiple glass siblings in a background layer for performance
- **Test on real backgrounds** — glass needs visual content behind it to show the blur effect
- **Reduce blur on mobile** — `blur(24px)` can be expensive; drop to `blur(16px)` on small screens
- **Use `oklch` for glass colors** — perceptual uniformity means `oklch(100% 0 0 / 0.04)` always reads as neutral regardless of hue

### Anti-Patterns Avoided
- Glass on everything — reserved for containers, headers, featured cards only
- Nesting glass inside glass — single-level glass surfaces throughout
- Forgetting `isolation` — causes z-index stacking bugs with pseudo-elements

---

## UI Demo

See `scripts/demo.cjs` for the Playwright recording script.

```bash
# Phase 1: Discover DOM
node scripts/demo.cjs --discover

# Phase 2: Verify selectors
node scripts/demo.cjs --rehearse

# Phase 3: Record
DEMO_URL=http://localhost:5173 node scripts/demo.cjs
# Output: screenshots/demo-xylo.webm
```

The demo covers: Landing hero → Features bento → Study modes → How it works → Schools → Pricing → Sign-up form.
