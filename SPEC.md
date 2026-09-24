# SPEC.md — warsportsgroup.com

Build specification for the WAR Sports Group website, V1.

This document is the source of truth for Claude Code. Three approved visual prototypes exist and should be treated as the design reference:

- Article page: https://claude.ai/artifact/VKPSySuTUGQJU9K2t5iRCx
- Homepage / index: https://claude.ai/artifact/MwwV7wLLpaMLtMjKXXp2he
- About page: https://claude.ai/artifact/8pkaQW7azLmNLELXTKoRzm

The prototypes are single-file HTML. This build reimplements them properly as components. Where this spec and a prototype disagree, this spec wins.

---

## 1. What this site is

A publishing site for long-form research and analysis on hockey operations, written by Matthew Meyer, Director of Hockey Operations at a four-sheet facility in Metro Detroit and a regional scout covering Michigan 16U/18U AAA and high school hockey.

**Primary success condition:** an essay reads beautifully on a phone when someone taps a LinkedIn link.

**Primary user path:** LinkedIn tap → article page on mobile → author block → About → contact.

Almost no one arrives at the homepage first. The article page is the most important page on the site. Build and polish it accordingly.

**Secondary condition:** the homepage index, read as a list of titles, functions as a professional credential for hockey operations roles.

---

## 2. Non-goals for V1

Do not build, and do not scaffold in anticipation of:

- Search
- Tags or categories beyond the single `label` field
- Pagination
- Comments
- Newsletter signup or email capture
- Light mode or a theme toggle (the site is dark only)
- A CMS or admin interface
- Authentication of any kind
- A database
- An author system (single author)
- Social share buttons
- Related-content grids or recommendation logic
- Cookie banners or analytics consent flows

Anything above is a V2 conversation, not a build item.

---

## 3. Stack

- **Framework:** Astro, latest stable
- **Content:** MDX via Astro content collections
- **Styling:** plain CSS with custom properties. No Tailwind, no CSS framework.
- **Hosting:** Vercel, with GitHub auto-deploy on push to `main`
- **Fonts:** Inter and JetBrains Mono, self-hosted as woff2 rather than loaded from Google Fonts CDN
- **Images:** Astro's built-in image optimization
- **JS:** vanilla, minimal. No client-side framework. Total shipped JS target under 5kb.

Rationale for static: no state, no login to expire, no service to go down, nothing to break at 9pm on a Saturday.

**Accounts:** WSG has its own GitHub and Vercel accounts, both registered under `matthew@warsportsgroup.com` (Google Workspace). They are deliberately separate from the accounts used for work projects. Constraints that follow from this:

- The WSG Vercel account is on the Pro plan, which covers commercial use and permits deploying from GitHub organizations. Even so, create the repo under the WSG personal GitHub account for V1. An organization adds administration with no benefit for a single-maintainer project, and the repo can be transferred into one later if needed.
- **DNS status: complete.** `warsportsgroup.com` and `www.warsportsgroup.com` are both connected and showing valid configuration, using an A record at the apex and a CNAME on `www` at Namecheap. Nameservers remain at Namecheap so the Google Workspace MX records are untouched, and mail delivery has been verified. Do not change nameservers or touch MX/TXT records for any reason.

---

## 4. Repo structure

```
/
├── src/
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── ProgressBar.astro
│   │   ├── TableOfContents.astro
│   │   ├── Figure.astro
│   │   ├── BarChart.astro
│   │   ├── Chip.astro
│   │   ├── AuthorBlock.astro
│   │   ├── IndexRow.astro
│   │   └── MoreWork.astro
│   ├── content/
│   │   ├── config.ts
│   │   └── writing/
│   │       └── *.mdx
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── 404.astro
│   │   └── writing/
│   │       └── [...slug].astro
│   ├── styles/
│   │   ├── tokens.css
│   │   └── global.css
│   └── lib/
│       └── readingTime.ts
├── public/
│   ├── fonts/
│   └── favicon.svg
└── astro.config.mjs
```

---

## 5. Content schema

Content collection `writing`, defined in `src/content/config.ts` with zod.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `subtitle` | string | yes | One line. Also used as the meta description and in the share card. |
| `date` | date | yes | Publication date |
| `number` | number | yes | Display number, e.g. 1 renders as `001` |
| `label` | enum | yes | `Essay` / `Organizational Study` / `Research` / `Private Report` |
| `visibility` | enum | yes | `public` / `gated` / `unlisted`. Default `public`. |
| `origin` | string | no | e.g. "Originally published at RWDH" |
| `featured` | boolean | no | Default false. One featured item renders larger at the top of the index. |
| `readingTime` | number | no | Auto-computed if absent, at 225 wpm |
| `topic` | string | no | Displayed in the article metadata row, e.g. "Detroit Red Wings" |

### Visibility states

- **`public`** — appears in the index, full page is readable.
- **`gated`** — appears in the index with an amber-bordered chip and an "Available on request" line. The row is not a link. No article page is generated. Used for private reports that should be visible as evidence of work without being readable.
- **`unlisted`** — does not appear in the index at all, but the article page is generated and reachable at its URL. Used for sending a piece directly to someone. Must also emit `<meta name="robots" content="noindex, nofollow">`.

Build must fail loudly on a duplicate `number` or a missing required field.

### Authoring loop this schema serves

1. Finished piece exists
2. Claude returns a complete `.mdx` file with frontmatter filled in
3. File dropped in `src/content/writing/`
4. Commit and push
5. Vercel deploys, share card generates automatically

Matthew never hand-writes frontmatter and never hand-makes a share image. If either becomes manual, publishing stops happening.

---

## 6. Design tokens

Dark only. Define in `src/styles/tokens.css` on `:root`. Set an explicit background on `body`. Do not implement `prefers-color-scheme` handling.

```css
:root {
  /* color */
  --bg:            #0A0B0D;   /* never pure black */
  --surface:       #14161A;
  --text:          #E4E6E9;
  --text-body:     rgba(228,230,233,.90);
  --muted:         #8B9299;
  --faint:         #5E656B;
  --hair:          rgba(255,255,255,.08);
  --hair-strong:   rgba(255,255,255,.16);
  --accent:        #E09B3D;

  /* type */
  --sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* layout */
  --measure:  64ch;
  --shell:    1180px;
  --gutter:   24px;
  --radius:   3px;
}
```

**Accent discipline:** the accent appears on roughly 1% of pixels. Permitted uses: the eyebrow label, the progress bar, blockquote left border, the highlighted data series in a chart, hover state on index row numbers, contact link, the Erie block's left border, and the gated chip. Nothing else.

**Radius discipline:** nothing above 4px anywhere. Precision means sharp.

**Borders:** 1px hairlines, never cards with shadows.

### Type scale

| Use | Family | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Body | sans | 19.5px | 300 | 1.75 | .001em |
| Lede paragraph | sans | 21px | 300 | 1.66 | |
| H1 article | sans | clamp(34px, 6.4vw, 54px) | 600 | 1.08 | -.024em |
| H1 homepage statement | sans | clamp(33px, 7.2vw, 58px) | 500 | 1.10 | -.026em |
| H2 section | sans | clamp(23px, 4vw, 29px) | 500 | 1.22 | -.012em |
| Section number | mono | 11px | 400 | | .22em, uppercase |
| Eyebrow | mono | 11px | 400 | | .22em, uppercase |
| Metadata | mono | 11px | 400 | | .14em, uppercase |
| Section label (h2 in About) | mono | 10.5px | 500 | | .24em, uppercase |
| Chip | mono | 9.5px | 400 | | .20em, uppercase |
| Pull quote | sans | clamp(20px, 3.6vw, 24px) | 300 | 1.42 | -.01em |
| Index row title | sans | clamp(21px, 3.4vw, 26px) | 400 | 1.25 | -.014em |
| Index row title (featured) | sans | clamp(25px, 4.6vw, 34px) | 400 | 1.16 | -.02em |
| Figure caption | sans | 13px | 300 | 1.5 | |

Body weight is 300, one step lighter than would be used on a light background, because dark backgrounds make type appear heavier.

Enable `font-feature-settings: "ss01","cv05"` on body.

### Motion

One effect only: sections and index rows fade up 10px over 0.7s on entry via IntersectionObserver, unobserved after firing. Chart bars animate width once on entry. Respect `prefers-reduced-motion: reduce` by disabling both.

---

## 7. Page specs

### 7.1 Article page — `/writing/[slug]`

Top to bottom:

1. **Progress bar.** 1px, accent, fixed at viewport top, z-index above header. Width tracks scroll percentage.
2. **Fixed header.** See 8.1.
3. **Title block.** Mono eyebrow reading `{LABEL} / {NUMBER}` with the number in `--faint` and the label in accent. H1. Subtitle in `--muted`, max 52ch. Metadata row bounded top and bottom by hairlines, containing date, reading time, and topic, separated by 1px 9px-tall dividers.
4. **Table of contents.** Desktop (≥1080px): sticky in a 200px left column, hairline left border, active section highlighted with an accent left border and `--text` color, driven by IntersectionObserver with rootMargin `-20% 0px -70% 0px`. Mobile: a `<details>` block labeled "Contents" with a `+` / `–` affordance, bounded by hairlines. Only renders when the piece has two or more H2s.
5. **Body.** Reading column capped at `--measure`. Paragraph bottom margin 26px.
6. **H2 sections.** Mono `Section {roman}` prefix stacked above the heading text in accent. Auto-generated `id` for TOC anchoring.
7. **Pull quotes.** 1px accent left border, 22px left padding, 40px vertical margin.
8. **Figures.** See 8.4. On desktop they break the reading column by 40px on each side.
9. **Author block.** See 8.5.
10. **More work.** Two or three rows. Never six.
11. **Footer.** See 8.2.

MDX must support a `<Figure>` and a `<BarChart>` component available without per-file imports.

### 7.2 Homepage — `/`

Doubles as the writing index. There is no separate index page and no `/writing` route listing.

1. **Statement block.** Mono kicker "Work. Achieve. Repeat." in accent. H1 statement, max 30ch, with large padding above and below. Supporting paragraph in `--muted`, max 44ch. No image, no hero, no graphic.
2. **Index header.** Mono row: "Selected work" left, year right.
3. **Rows.** Desktop grid of `62px | 1fr | 128px` for number, content, date. Mobile stacks to a single column with the date last. Each row: mono number in `--faint` turning accent on hover, chip for `label`, title, subtitle max 56ch, optional `origin` line. Hairline below each row, `--hair-strong` above the first. Row hover tints the background by 1.7% white on desktop only.
4. **Featured row.** Larger title. One maximum.
5. **Footer.**

No cap on row count. The index scrolls indefinitely as work accumulates. An archive that keeps going is a feature.

### 7.3 About — `/about`

Order is deliberate. Credentials come before publication types, because credentials answer "should I keep reading."

1. Mono "About" kicker, H1 statement, lede paragraph, one supporting paragraph.
2. **Who writes this.** 172px square portrait, 1:1, hairline border, `filter: grayscale(1) contrast(1.05) brightness(.95)` applied in CSS so any supplied photo is desaturated automatically. Faint crosshair grid overlay. Name, mono role line in accent, then two paragraphs. Desktop layout is a `172px | 1fr` grid with 38px gap; stacks on mobile.
3. **Background.** Spec table, `38%` label column in mono uppercase `--faint`, value column at 16.5px. Hairlines between rows and above the first.
4. **What gets published here.** One row per label with a chip and a one-line description.
5. **Also in progress.** The Erie block: surface panel, 1px hairline border with a 1px accent left border, `FICTION` chip, mono "Expected late 2026" status, italic title, one paragraph. See open items regarding its lifecycle after publication.
6. **Contact.** One line stating what he is open to, then a mono accent mailto link, then an "Elsewhere" row of mono uppercase links.
7. **Footer.**

### 7.4 404

- Mono `404` in accent
- One line of copy with some personality. Default: "That page isn't on the roster."
- One link back to the index
- Same header, footer, and tokens as every other page
- Nothing else

---

## 8. Components

### 8.1 SiteHeader
Fixed, full width, `rgba(10,11,13,.82)` with `backdrop-filter: blur(12px)`, 1px hairline bottom border. Inner bar max `--shell`, 13px vertical padding. Left: wordmark, a 15px crosshair mark (1px cross lines in `--faint` with a 1px accent circle inset 3.5px) plus mono `WAR` at weight 500 followed by `Sports Group` in `--faint`. Right: a single mono uppercase nav link. On the homepage that link is "About"; on About it is "Writing"; on an article it is "About".

The crosshair is a placeholder. It must be swappable for a supplied SVG logo by replacing one component.

### 8.2 SiteFooter
Hairline top border. Mono uppercase row, space-between, wrapping on mobile: "WAR Sports Group", nav links, copyright year. No newsletter, no social icon set.

### 8.3 Chip
Inline mono uppercase, 1px `--hair-strong` border, 2px radius, 3px/7px padding. Variant `private` uses `rgba(224,155,61,.35)` border and accent text.

### 8.4 Figure
Surface background, 1px hairline border, 3px radius, 26px/22px padding. Contains a mono "Figure NN" label in `--faint`, a 16.5px title, the visual, and a caption above a hairline top border at 13px in `--faint`.

### 8.5 BarChart (house data style)
Horizontal bars. Track is `rgba(255,255,255,.04)`, 22px tall, 2px radius. Default fill `rgba(255,255,255,.14)`. One series may be flagged `highlight` and uses the accent. Value labels in mono 11px, right-aligned inside the track. Series names above each bar in mono 10.5px uppercase `--muted`. Bars animate width once on scroll entry over 1.1s.

This is the house chart identity. Grayscale by default, accent reserved for the single data point being argued about, mono labels throughout. Every future chart type added to the site must follow the same rules.

### 8.6 AuthorBlock
`--hair-strong` top border, 34px top padding. Mono "Author" label, 22px name, one paragraph in `--muted` at 16.5px, then a mono accent contact link with a translucent accent underline.

This is the conversion point of the site. Treat it as a section, not a footnote.

---

## 9. Share cards

Auto-generated Open Graph images at build time, 1200x630, using Satori or `@vercel/og`.

Card composition, matching site tokens:
- `--bg` background
- Mono eyebrow `{LABEL} / {NUMBER}` in accent
- Title in Inter 600, wrapped, dominant
- Subtitle in `--muted`, two lines maximum
- Bottom row: crosshair mark plus `WAR SPORTS GROUP` in mono uppercase
- A single 1px accent line along the top edge

Every page also needs `og:title`, `og:description`, `og:image`, `twitter:card` set to `summary_large_image`, and a canonical URL.

The share card is the first impression, before the site even loads. It matters as much as any page.

---

## 10. Quality targets

- Lighthouse 95+ on all four categories, mobile
- Zero cumulative layout shift. Self-host fonts, `font-display: swap`, explicit image dimensions.
- Total shipped JS under 5kb
- Fully usable at 320px width
- No horizontal body scroll at any width. Wide content scrolls inside its own `overflow-x: auto` container.
- Visible focus states on every interactive element, accent-based
- Semantic headings in order, one H1 per page
- Text contrast meets WCAG AA against `--bg`
- `sitemap.xml` and `robots.txt` generated, with `unlisted` pieces excluded from the sitemap

---

## 11. Build milestones

Work one milestone at a time. Deploy at the end of each.

**M1. Scaffold and deploy.** Astro project, content collection and zod schema, tokens.css, self-hosted fonts, BaseLayout, SiteHeader, SiteFooter, live on Vercel with a placeholder homepage.

**M2. Article template.** ArticleLayout, full typography, progress bar, TOC desktop and mobile, section numbering, pull quotes, Figure, BarChart, AuthorBlock, MoreWork. Load one real long piece and verify on a phone.

**M3. Homepage index.** Statement block, IndexRow, featured variant, all three visibility states behaving correctly.

**M4. About and 404.** Portrait treatment, spec table, publication types, Erie block, contact, plus the 404.

**M5. Share cards and metadata.** OG image generation, full meta tags, sitemap, robots, favicon.

**M6. Polish.** Mobile pass at 320px, reduced-motion pass, focus states, Lighthouse, real content load. Domain is already connected and valid, so no DNS work remains.

---

## 12. Open items

Carried forward, not blocking M1 or M2.

1. **Logo.** Crosshair mark is a CSS placeholder. Swap in real SVG when ready.
2. **Accent color.** `#E09B3D` is approved provisionally. Revisit once the logo is finalized so they match.
3. **Portrait.** Best option is a new photo shot in a rink, dark environment. Fallback is a tight, desaturated crop of the existing 2019 headshot. The CSS grayscale filter makes either work.
4. **Employer naming.** Currently generic: "four-sheet facility in Metro Detroit", "regional scout, junior hockey". Decide whether to name the facility and the junior team.
5. **Ambition line.** The About bio currently states the goal of hockey operations work at the team level. Keep or cut.
6. **Contact address.** `matthew@warsportsgroup.com` is confirmed and live on Google Workspace. Wire it into the About page and the article author block.
7. **Bio and Erie copy.** Both are Claude drafts standing in for Matthew's own voice. Rewrite before launch.
8. **Gated state.** Confirm whether the `gated` visibility state is wanted at all, or whether the model is public and unlisted only.
9. **Erie lifecycle.** "Coming soon" has a shelf life. At publication the block either becomes a single line with a purchase link or Erie gets its own page. The pen name has been scrapped, so linking the book under Matthew's own name is now viable.
10. **Launch inventory.** At least four or five genuinely public pieces should exist before launch. A research site with one essay reads like an empty arena. This is a content requirement, not a build requirement.

---

## 13. Standing rules

- No em dashes in any copy anywhere on the site.
- Restraint is the aesthetic. If a decision is between adding something and removing something, remove.
- Every addition to V1 scope past this document is a V2 item unless explicitly agreed.
