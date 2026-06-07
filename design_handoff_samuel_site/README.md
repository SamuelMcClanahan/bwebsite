# Handoff: samuel.m Personal Site

## Overview

A personal website for Samuel L. McClanahan — a high school engineer in San Francisco building robots, embedded systems, and agentic tools. The site has a **terminal × elegant serif** aesthetic: dark background, Montserrat headings, Avenir body text, 0xProto Nerd Font Mono for all monospaced/terminal elements, and a muted dark-red accent gradient that washes over the entire page.

The target stack is **Astro** (static site generator), with content stored in Astro content collections (Markdown files with frontmatter). The design prototype was built as a React SPA for rapid iteration; the developer should recreate it as a proper Astro project — not ship the HTML directly.

## Fidelity

**High-fidelity.** The prototype is pixel-complete with final colors, typography, spacing, components, and interactions. Recreate it as close to pixel-perfect as possible using Astro + your choice of component framework (React island or vanilla JS for interactive bits). The zsh command palette, theme toggle, and blog filters are interactive components that need JS.

---

## Design Tokens

### Colors (CSS custom properties — dark mode defaults)

```css
--bg:                  #0a0807
--fg:                  #bdb6ad
--fg-strong:           #f0ebe2
--fg-mid:              #a8a098
--fg-dim:              #7a7268
--fg-faint:            #5d564e
--fg-ghost:            #3a342e
--accent:              #c8413a
--accent-bright:       #e8a59f
--accent-dim:          #7a4a45
--accent-soft:         rgba(120,40,35,0.10)
--accent-line:         rgba(120,40,35,0.12)
--accent-line-strong:  rgba(120,40,35,0.18)
--surface:             rgba(16,13,11,0.5)
--surface-2:           rgba(10,8,7,0.4)
--topbar-bg:           rgba(10,8,7,0.7)
--green:               #7ec07e   /* prompt user color */
--host:                #d4847e   /* prompt host color */
--info:                #7ec0d4   /* callout INFO */
--warn:                #d4a07e   /* callout WARN */
--note:                #d4847e   /* callout NOTE */
--paper:               rgba(245,240,232,0.02)
--wash-1:              rgba(157, 58, 53, 0.18)  /* top-right bg bloom */
--wash-2:              rgba(120, 40, 35, 0.10)  /* right-center bloom */
--wash-3:              rgba(120, 40, 35, 0.14)  /* bottom-left bloom */
```

### Colors — Light Mode overrides

```css
--bg:                  #f4f0ea
--fg:                  #3d3530
--fg-strong:           #1a1410
--fg-mid:              #5d5048
--fg-dim:              #8a7a6e
--fg-faint:            #a89a8e
--fg-ghost:            #d4cabe
--accent:              #9a2a24
--accent-bright:       #c8413a
--surface:             rgba(255,250,242,0.6)
--surface-2:           rgba(245,240,232,0.7)
--topbar-bg:           rgba(244,240,234,0.75)
--green:               #3a7a4a
--host:                #9a2a24
--wash-1:              rgba(200, 80, 70, 0.10)
--wash-2:              rgba(180, 70, 60, 0.06)
--wash-3:              rgba(180, 70, 60, 0.08)
```

Theme is toggled by swapping CSS custom properties on `<body>`. Persist choice in `localStorage` under key `slm-theme`. Default: `dark`.

### Typography

| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Page title (H1) | Montserrat | 700 | 48–56px | letter-spacing: -0.03em |
| Section header (H2) | Montserrat | 600 | 26–30px | |
| Sub-header (H3) | Montserrat | 600 | 22px | |
| Card title | Montserrat | 600 | 18–24px | |
| Body / prose | Avenir Next, Avenir, Montserrat | 400 | 15–16px | line-height: 1.65 |
| Terminal / mono | 0xProto Nerd Font Mono, 0xProto | 400 | 11–13px | all prompts, dates, tags, code |
| Code blocks | 0xProto Nerd Font Mono, 0xProto | 400 | 12.5px | |

Load 0xProto from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=0xProto:wght@400&display=swap" rel="stylesheet"/>
```

0xProto Nerd Font Mono is a locally-installed Nerd Font — declare it first in the stack; it'll use the local install if present, fall back to the Google Fonts 0xProto otherwise.

### Spacing

Content columns:
- Home: `max-width: 760px`, centered, `padding: 40px 0`
- Blog: `max-width: 820px`, centered
- Blog post: `max-width: 1180px`, two-column `1fr 240px` with `gap: 56px`
- Work: `max-width: 920px`, two-column card grid `1fr 1fr` with `gap: 14px`
- CV: `max-width: 820px`
- Project detail: `max-width: 1080px`, two-column `1fr 240px`

Global shell padding: `padding: 24px 24px 80px` on `<main>`.

### Background gradient blooms (full-bleed, pointer-events: none)

Three absolutely-positioned divs inside the root, z-index 0, behind all content:

```css
/* Top-right warm red bloom */
position: absolute; top: -15%; right: -10%;
width: 70%; height: 60%;
background: radial-gradient(circle at center, var(--wash-1) 0%, transparent 70%);
filter: blur(40px);

/* Right-center dimmer bloom */
position: absolute; top: 30%; right: -20%;
width: 50%; height: 50%;
background: radial-gradient(circle at center, var(--wash-2) 0%, transparent 70%);
filter: blur(50px);

/* Bottom-left bloom */
position: absolute; bottom: -10%; left: -15%;
width: 70%; height: 60%;
background: radial-gradient(circle at center, var(--wash-3) 0%, transparent 70%);
filter: blur(40px);
```

---

## Shell / Layout

Every page shares a persistent shell. In Astro this should be `src/layouts/Shell.astro`.

### Sticky top bar

- `position: sticky; top: 0; z-index: 10`
- `background: var(--topbar-bg); backdrop-filter: blur(12px)`
- `border-bottom: 1px solid var(--accent-line)`
- Height ~49px, `padding: 8px 24px`
- Font: 0xProto mono, 12px

**Left side — tabs:**
Four tab buttons: `~/` · `~/projects` · `~/blog` · `~/cv`
- Default: `color: var(--fg-dim)`, transparent bg
- Active: `color: var(--fg-strong); background: var(--accent-soft)`
- NO dot indicator on active tab
- Hover: `color: var(--fg-strong)`

**Right side:**
1. `:  zsh` button — opens command palette. Border: `1px solid var(--accent-line-strong)`. On click, toggle a sticky panel below the topbar.
2. Sun/moon icon button — toggles light/dark. Same border style. Shows sun (☀) in dark mode, moon (☾) in light mode.
3. Live UTC clock — `font: 0xProto 11px; color: var(--fg-faint)`. Updates every second via `setInterval`.

### Persistent breadcrumb prompt

Below the topbar, always visible:

```
samuel@build:~/blog$ _
```

- Font: 0xProto mono, 12px
- `samuel` → `color: var(--green)`
- `@` · `:` → `color: var(--fg-faint)`
- `build` → `color: var(--host)`
- path (e.g. `~/blog`) → `color: var(--fg-mid)`
- `$` → `color: var(--accent)`
- `_` cursor → `color: var(--accent)`, CSS animation `blink 1.2s steps(2) infinite`

Path updates per page:
- Home → `~/`
- Work index → `~/projects`
- Project detail → `~/projects/<id>`
- Blog index → `~/blog`
- Blog post → `~/blog/<slug>`
- CV → `~/cv`

### zsh command palette

Slides in below topbar (sticky, z-index 9) when opened. Same `backdrop-filter: blur(12px)` background. Shows a scrollable history of past commands + responses, then a live input row styled like a terminal prompt.

Supported commands:
| Command | Effect |
|---------|--------|
| `ls` / `ls ~/` | prints `projects/  blog/  cv/  about` |
| `cd ~/blog` | navigates to blog |
| `cd ~/projects` | navigates to work |
| `cd ~/cv` | navigates to CV |
| `cd` (bare) | navigates to home |
| `pwd` | prints current breadcrumb path |
| `whoami` | prints `samuel` |
| `theme` | toggles light/dark |
| `help` | lists commands |
| `clear` | clears history |
| anything else | `zsh: command not found: <cmd>` |

Press `Escape` to close.

### Footer

- Thin horizontal gradient rule: `linear-gradient(90deg, transparent, var(--accent) 50%, transparent)` at 50% opacity
- Below that: social icons (left) + copyright (right)
- Social icons: GitHub · LinkedIn · Email · Discord · RSS — 14×14px SVG fills, `color: var(--fg-faint)`, hover → `color: var(--accent-bright)`
- Copyright: `© 2026 samuel m · built with astro`, 0xProto 11px, `color: var(--fg-faint)`

---

## Pages

### 1. Home (`~/`)

`src/pages/index.astro`

**Layout:** single column, `max-width: 760px`, centered.

**Mark row** (top of hero):
- Small 36×36px rounded square (`border-radius: 6px`)
- Background: `linear-gradient(135deg, #2a1614, #160c0a)`, border: `1px solid var(--accent-line-strong)`
- Text inside: `slm`, Montserrat italic, 14px, `color: var(--accent-bright)`
- Right of mark: name (`color: var(--fg-strong)`, 13px) + location (`color: var(--fg-faint)`, 11px mono)

**H1:** Montserrat 700, 48px. The gradient phrase uses:
```css
background: linear-gradient(110deg, #e8a59f 0%, #c8413a 40%, #7a2520 80%, #4a1a18 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**Body intro block:** `›` prompt in `var(--accent)` mono, followed by body text in Avenir 15.5px `var(--fg-mid)`.

**Latest posts section:**
- Header row: `$ ls -lt ~/blog | head` (mono) + `view all →` link
- List of 4 most-recent posts, each a `<a>` row:
  - Grid: `90px 1fr auto`
  - Date: 0xProto 11px `var(--fg-faint)`
  - Title: Avenir 15px `var(--fg-strong)`
  - Tags: `#tag` in 0xProto 10px `var(--accent-dim)`
  - Bottom border: `1px solid var(--accent-line)`

**Bottom bloom:** `height: 80px; background: radial-gradient(ellipse at center, rgba(200,65,58,0.08), transparent 70%)`

---

### 2. Blog Index (`~/blog`)

`src/pages/blog/index.astro`

**H1:** `blog`, Montserrat 700 56px.
**Lede:** `›` + text in Avenir, `color: var(--fg-dim)`.

**Filter + sort bar:**
- Padded container `background: var(--surface); border: 1px solid var(--accent-line); border-radius: 6px`
- `--filter` label (mono) + chips: `all` · `writeup` · `project`
- `--sort` label + chips: `newest` · `oldest` · `a-z`
- Chip: border `1px solid var(--accent-line-strong)`, bg transparent, mono 11px
- Active chip: `background: var(--accent-soft); color: var(--accent-bright); border-color: var(--accent-line-strong)` — **no dot**

**Post list:** flat, date-sorted (no year grouping). Each row:
- Grid: `110px 1fr 24px`
- Date: formatted as `Apr 12, 2026`, mono 11px `var(--fg-faint)`
- Title: Avenir 15px `var(--fg-strong)`
- Excerpt: Avenir 13.5px `var(--fg-dim)`
- Tags: `#tag` mono 10px `var(--accent-dim)`
- Arrow: `→` `var(--fg-faint)`
- Bottom border: `1px solid var(--accent-line)`

---

### 3. Blog Post (`~/blog/<slug>`)

`src/pages/blog/[slug].astro`

**Data model (Astro content collection — `src/content/blog/<slug>.md`):**
```yaml
---
title: "picoCTF 2026: Paper-2 Writeup + Reflections"
date: 2026-03-19
tags: [web, ctf, writeup, picoctf]
category: writeup
excerpt: "Bypassing CSP via cache-eviction side channels at 2am."
---
```

**Layout:** `max-width: 1180px`, two-column `minmax(0,1fr) 240px`, `gap: 56px`.

**Header:**
- `← back to ~/blog` link in 0xProto 12px `var(--fg-dim)`
- H1: Montserrat 700, 44px, `text-wrap: balance`
- Meta row: date (mono) · tags (`#tag` mono 11px `var(--accent-dim)`)

**Article body:**
- Body font: Avenir 15.5px, line-height 1.7
- H2: Montserrat 600, 30px. Prefixed with `#` in `var(--accent)` mono 24px.
- H3: Montserrat 600, 22px.
- Code inline: 0xProto 12.5px, `background: var(--accent-soft); padding: 1px 6px; border-radius: 3px; color: var(--accent-bright)`
- Code block: 0xProto 12.5px, `background: var(--surface); border: 1px solid var(--accent-line); border-radius: 6px; padding: 14px 16px`
- Links: `color: var(--accent-bright); text-decoration: underline; text-underline-offset: 3px`

**Callout boxes** (INFO / WARN / NOTE):
```
border-left: 2px solid <color>
background: var(--surface)
border: 1px solid var(--accent-line)
border-radius: 6px
padding: 14px 18px
```
Colors: INFO → `var(--info)` (#7ec0d4) · WARN → `var(--warn)` (#d4a07e) · NOTE → `var(--note)` (accent)

**Challenge info card** (for CTF writeups):
- Dark bordered card: `background: var(--surface); border: 1px solid var(--accent-line); border-radius: 8px; padding: 22px 24px`
- Header: title (0xProto 16px) + status badge (0xProto 10px, `color: var(--accent-bright)`, border `var(--accent-line-strong)`)
- Grid of rows: icon · LABEL (mono 10px uppercase) · value
- Flag box at bottom: 0xProto, `color: var(--accent-bright)`, darker inset bg

**TOC sidebar (right column):**
- `position: sticky; top: 100px`
- Nested `<ul>` with left border `1px solid var(--accent-line)`
- Each link: Avenir 12.5px `var(--fg-dim)`, `padding: 5px 12px`
- Active link: `color: var(--fg-strong)` + left border accent bar `1.5px solid var(--accent)`

---

### 4. Work / Projects Index (`~/projects`)

`src/pages/projects/index.astro`

**H1:** `projects`, Montserrat 700 56px.
**Lede:** `›` prompt + Avenir body.
**Command line strip:** `$ ls --tree ~/projects` (mono) + entry count.

**Card grid:** `display: grid; grid-template-columns: 1fr 1fr; gap: 14px`

Each card is a `<a>` styled as:
- `background: var(--surface); border: 1px solid var(--accent-line); border-radius: 8px; padding: 20px 22px`
- Hover: `border-color: var(--accent-line-strong); background: rgba(28,16,14,0.55); transform: translateY(-1px)`
- Status badge: `var(--accent-bright)` text, mono 10px uppercase, bordered
- Title: Montserrat 600, 24px, `var(--fg-strong)`
- Tag: 0xProto 11px `var(--accent-dim)`
- Description: Avenir 13.5px `var(--fg-dim)`, `line-height: 1.55`
- Footer row: `open →` in `var(--accent-bright)` — **no number prefix, no year**
- `outline: none` on focus (no browser default focus ring)

---

### 5. Project Detail (`~/projects/<id>`)

`src/pages/projects/[id].astro`

**Data model (Astro content collection — `src/content/projects/<id>.md`):**
```yaml
---
name: orbiter
tag: "agents · rust"
status: active
year: "2026 — present"
summary: "One-line summary."
---
Long-form body in markdown.
```

**Layout:** `max-width: 1080px`, two-column `minmax(0,1fr) 240px`.

**Header:** meta row (tag · year · status in mono), H1 Montserrat 700 56px, summary in Avenir 16px.

**Article body:** same heading/body/code styles as blog post.

**Right sidebar — facts panel:**
```
position: sticky; top: 100px
background: var(--surface)
border: 1px solid var(--accent-line)
border-radius: 8px; padding: 16px 18px
```
Rows: STATUS · STACK · STARTED · REPO — mono 10px label, Avenir 13px value.

---

### 6. CV (`~/cv`)

`src/pages/cv.astro`

**H1:** `cv`, Montserrat 700 56px.
**Lede:** `›` + Avenir text.

**Download button:**
- `background: linear-gradient(180deg, rgba(157,58,53,0.20), rgba(120,40,35,0.10))`
- `border: 1px solid var(--accent-line-strong); border-radius: 6px`
- `color: var(--accent-bright)`, 0xProto 13px
- Shows file size

**CV preview panel:**
- Fake window chrome: traffic-light dots area + filename in 0xProto
- Body: `padding: 40px 48px`
- Sections: EDUCATION · PROFESSIONAL EXPERIENCE · PROJECTS · ROBOTICS · CYBERSECURITY · SKILLS · AWARDS
- Section headers: Montserrat 600, 11px, `color: var(--accent)`, `letter-spacing: 0.15em`, bottom border `1px solid var(--accent-line)`
- Row: primary (Avenir 500 14px `var(--fg-strong)`) + secondary (Avenir 13px `var(--fg-dim)`) + right date (Montserrat 600 11px `var(--fg-faint)`)

**Real CV content:**
- Name: Samuel L. McClanahan
- Contact: San Francisco, CA · 415-529-0294 · porkbuns1964@gmail.com · github.com/ItzCopiouz
- Education: Lowell High School — GPA 3.86 UW, 1480 PSAT, AP Physics 1&2, AP Calc BC, Multivariable Calc (West Valley College)
- Experience: DoseNet Radwatch/UC Berkeley (intern, 3D-printed enclosures for monitoring systems, SolidWorks), YuppAI (intern, Discord bot, GTM), Math & SAT tutor
- Projects: RAG Cisco API, ESP32-CAM vision device, Self-hosted SBC server
- Robotics: FRC Captain Highlander Robotics (top ~50 worldwide, ~$100k budget), Mentor FRC 10221
- Cybersecurity: CyberPatriot co-founder (3/4787 nationally), DEF CON CTF 1st, PicoCTF 5th nationally, SquirrelCTF 1st
- Skills: PTC Onshape/SolidWorks/Fusion 360, C/C++/Python, Cisco networking, ESP32, Spanish (Seal of Biliteracy)
- Awards: AP Scholar, MTAC State Honors 4×, SF All-City Jazz Band 1st Trumpet 2×

---

## Astro Content Collections

### `src/content/blog/<slug>.md`
Frontmatter: `title`, `date` (YYYY-MM-DD), `tags` (array), `category` (`writeup` | `project`), `excerpt`

### `src/content/projects/<id>.md`
Frontmatter: `name`, `tag`, `status` (`active` | `shipped` | `v1` | `v2`), `year`, `summary`
Body: full markdown writeup shown on the project detail page.

---

## Interactions & Animations

| Element | Behavior |
|---------|----------|
| Page transition | `opacity: 0 → 1, translateY(4px → 0)`, 250ms ease-out |
| Tab switch | Instant (no animation) |
| Card hover | `border-color` + `transform: translateY(-1px)`, 150ms |
| Theme toggle | CSS vars swap on `<body>` with `transition: background .25s ease, color .25s ease` |
| Cursor `_` | `blink 1.2s steps(2) infinite` keyframe |
| zsh panel | Slides in sticky below topbar; `Escape` closes |
| Scrollbar | 8px, no track, thumb `var(--accent-line-strong)` |

Focus behavior: `outline: none` on all `<button>` elements (no default browser focus rings). Keep `focus-visible` for keyboard users on links and inputs.

---

## Assets

| Asset | Description | Location |
|-------|-------------|----------|
| `footer-mountains.svg` | Generated atmospheric mountain silhouette | `assets/footer-mountains.svg` |

The SVG uses inline radial/linear gradients for the dark mountain range with a warm red glow at the horizon. Embed it directly or reference as an `<img>`.

---

## Files in this Bundle

| File | Purpose |
|------|---------|
| `samuel.m.html` | Main prototype (full SPA, all pages interactive) |
| `site/shell.jsx` | Shared shell: topbar, breadcrumb, zsh palette, footer |
| `site/data.jsx` | Sample data: posts, projects |
| `site/page-home.jsx` | Home page component |
| `site/page-blog.jsx` | Blog index component |
| `site/page-post.jsx` | Blog post component (includes callouts, challenge card, TOC) |
| `site/page-work.jsx` | Projects index component |
| `site/page-project-cv.jsx` | Project detail + CV page components |
| `assets/footer-mountains.svg` | Footer atmospheric image |

Open `samuel.m.html` in a browser to interact with the full prototype. All navigation, theme toggle, and zsh commands work.

---

## Suggested Astro Project Structure

```
src/
  layouts/
    Shell.astro         # Topbar, prompt, zsh palette, footer, bg blooms
    BlogPost.astro      # Article + TOC two-column layout
    ProjectDetail.astro # Project writeup + facts panel
  pages/
    index.astro         # Home
    blog/
      index.astro       # Blog index (filter/sort)
      [slug].astro      # Individual post
    projects/
      index.astro       # Work grid
      [id].astro        # Project detail
    cv.astro            # CV page
  content/
    blog/
      *.md              # Posts with frontmatter
    projects/
      *.md              # Projects with frontmatter
  styles/
    global.css          # CSS vars (dark + light tokens), fonts, reset
    animations.css      # blink, fadeIn keyframes
  scripts/
    theme.ts            # localStorage theme persistence
    zsh.ts              # Command palette logic
```

> **Note:** The zsh command palette, theme toggle, and blog filter/sort need client-side JS. Use Astro's `client:load` directive on those islands, or implement them as lightweight vanilla JS modules.
