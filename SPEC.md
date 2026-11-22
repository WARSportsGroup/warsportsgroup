# SPEC.md: warsportsgroup.com

Build specification for the WAR Sports Group website, V1.

This document is the source of truth for Claude Code. Three approved visual prototypes exist and should be treated as the design reference:

- Article page: https://claude.ai/artifact/VKPSySuTUGQJU9K2t5iRCx
- Homepage / index: https://claude.ai/artifact/MwwV7wLLpaMLtMjKXXp2he
- About page: https://claude.ai/artifact/8pkaQW7azLmNLELXTKoRzm

Local copies live in `design-reference/`. The prototypes are single-file HTML. This build reimplements them properly as components. Where this spec and a prototype disagree, this spec wins.

**Status (November 2026):** V1 is built and live at https://www.warsportsgroup.com. Milestones M1 through M6 are complete. This document describes the site as built, including decisions made during the build. Section 14 records the decisions that changed or extended the original spec, and why.

---

## 1. What this site is

A publishing site for long-form research and analysis on hockey operations, written by Matthew Meyer, Director of Hockey Operations at Buffalo Wild Wings Arena in Troy, Michigan, and a Regional Scout for the Toledo Cherokee of the NCDC, covering Michigan 16U/18U AAA and high school hockey.

**Primary success condition:** an essay reads beautifully on a phone when someone taps a LinkedIn link.

**Primary user path:** LinkedIn tap → article page on mobile → author block → About → contact.

Almost no one arrives at the homepage first. The article page is the most important page on the site. Build and polish it accordingly.

**Secondary condition:** the homepage index, read as a list of titles, functions as a professional credential for hockey operations roles.

---

## 2. Non-goals for V1

Do not build, and do not scaffold in anticipation of:

- Search
- Tags or categories beyond the `label` field (which holds one label, or two for a piece that is both; see section 5)
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

- **Framework:** Astro 7, static output, no adapter. The site builds to plain files.
- **Content:** MDX via Astro content collections
- **Markdown processing:** `@astrojs/markdown-remark` (the unified processor). Astro 7's default processor does not run rehype plugins, and the site relies on one (see section 7.1).
- **Styling:** plain CSS with custom properties. No Tailwind, no CSS framework. Each page's CSS is inlined into its HTML, so there are no render-blocking stylesheet requests.
- **Hosting:** Vercel, with GitHub auto-deploy on push to `main`. Build command `npm run build`, output `dist`. Node 22.12 or later.
- **Fonts:** Inter and JetBrains Mono, self-hosted as latin-subset variable woff2 in `public/fonts`, the same files Google Fonts serves. Static TTF copies in `src/og/fonts` are used only by the share card renderer at build time and never ship to readers.
- **Images:** Astro's built-in image optimization
- **Share cards:** `satori` and `@resvg/resvg-js`, build time only
- **JS:** vanilla, minimal. No client-side framework. Total shipped JS target under 5kb. Actual: roughly 1.2 to 1.5kb on an article page.

**Dependencies are kept to five:** `astro`, `@astrojs/mdx`, `@astrojs/markdown-remark`, `satori`, `@resvg/resvg-js`. Ask before adding another.

Rationale for static: no state, no login to expire, no service to go down, nothing to break at 9pm on a Saturday.

**Accounts:** WSG has its own GitHub and Vercel accounts, both registered under `matthew@warsportsgroup.com` (Google Workspace). They are deliberately separate from the accounts used for work projects. Constraints that follow from this:

- The WSG Vercel account is on the Pro plan, which covers commercial use and permits deploying from GitHub organizations. Even so, create the repo under the WSG personal GitHub account for V1. An organization adds administration with no benefit for a single-maintainer project, and the repo can be transferred into one later if needed.
- **DNS status: complete.** `warsportsgroup.com` and `www.warsportsgroup.com` are both connected and showing valid configuration, using an A record at the apex and a CNAME on `www` at Namecheap. Nameservers remain at Namecheap so the Google Workspace MX records are untouched, and mail delivery has been verified. Do not change nameservers or touch MX/TXT records for any reason.
- **Canonical host is `www`.** Vercel redirects the apex to `https://www.warsportsgroup.com`, and `site` in `astro.config.mjs` matches. Canonical URLs, share cards and the sitemap all use the `www` host.
- **URLs have no trailing slash and no `.html`.** Astro builds with `build.format: 'file'` and `trailingSlash: 'never'`, and `vercel.json` sets `cleanUrls: true` and `trailingSlash: false`. `/about/` redirects to `/about`.

---

## 4. Repo structure

```
/
├── design-reference/          approved prototypes, reference only
├── src/
│   ├── assets/
│   │   └── portrait.jpg       About portrait, optimized at build
│   ├── components/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── Mark.astro         the site mark in the header
│   │   ├── ProgressBar.astro
│   │   ├── TableOfContents.astro
│   │   ├── Figure.astro
│   │   ├── BarChart.astro
│   │   ├── LoopDiagram.astro
│   │   ├── Table.astro        scroll wrapper for MDX tables
│   │   ├── Chip.astro
│   │   ├── Portrait.astro
│   │   ├── AuthorBlock.astro
│   │   ├── IndexRow.astro
│   │   └── MoreWork.astro
│   ├── content/
│   │   └── writing/
│   │       └── *.mdx
│   ├── content.config.ts      collection and zod schema
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   ├── og/
│   │   └── fonts/             TTFs for share cards, build time only
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── 404.astro
│   │   ├── favicon.svg.ts     favicon: the heavy mark, colored from tokens.css
│   │   ├── robots.txt.ts
│   │   ├── sitemap.xml.ts
│   │   ├── og/
│   │   │   └── [...slug].png.ts
│   │   └── writing/
│   │       └── [...slug].astro
│   ├── styles/
│   │   ├── tokens.css
│   │   └── global.css
│   └── lib/
│       ├── format.ts          display numbers, dates, labels, roman numerals
│       ├── mark.ts            the logo mark's geometry, both weights
│       ├── og.ts              share card renderer
│       ├── readingTime.ts
│       ├── rehypeSections.ts  wraps each H2 section for motion and the TOC
│       ├── site.ts            homepage and About headlines, shared with share cards
│       ├── tokens.ts          reads tokens.css for build-time output
│       └── writing.ts         loads the collection and enforces cross-file rules
├── public/
│   └── fonts/
├── astro.config.mjs
└── vercel.json
```

Astro 7 reads the collection config from `src/content.config.ts`, not `src/content/config.ts`.

---

## 5. Content schema

Content collection `writing`, defined in `src/content.config.ts` with zod. The schema is strict: unknown frontmatter keys fail the build, so a typo cannot be silently ignored.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Use a curly apostrophe (’), since frontmatter is not typeset like body text. |
| `subtitle` | string | yes | One line. Also used as the meta description and in the share card. |
| `date` | date | yes | Publication date. Only month and year are displayed. |
| `number` | number | yes | Display number, e.g. 1 renders as `001`. Numbers follow publication order. |
| `label` | enum, or a list of up to two | yes | `Essay` / `Organizational Study` / `Research` / `Private Report`. A single value (`label: "Essay"`) or a list for a piece that is both (`label: ["Organizational Study", "Research"]`). |
| `visibility` | enum | yes | `public` / `gated` / `unlisted`. Required, with no default, so a missing value fails loudly. |
| `origin` | string | no | e.g. "Originally published at RWDH" |
| `featured` | boolean | no | Default false. One featured item renders larger at the top of the index. |
| `readingTime` | number | no | Auto-computed if absent, at 225 wpm |
| `topic` | string | no | Displayed in the article metadata row, e.g. "Detroit Red Wings" |
| `sectionNumbers` | boolean | no | Default true. Set false for a piece that carries its own part numbering in its headings (e.g. "Part I: Why Now"), which turns off the automatic "Section I" labels for that piece only. |

### Visibility states

- **`public`:** appears in the index, full page is readable.
- **`gated`:** appears in the index with an amber-bordered chip and an "Available on request" line. The row is not a link. No article page is generated. Used for private reports that should be visible as evidence of work without being readable.
- **`unlisted`:** does not appear in the index at all, but the article page is generated and reachable at its URL. Used for sending a piece directly to someone. Emits `<meta name="robots" content="noindex, nofollow">`, never appears in More work, and is excluded from the sitemap. It still gets a share card so a direct link previews properly.

`Private Report` and `gated` go together: a piece carries the `Private Report` label if and only if it is gated. The gated state is kept for future private work even though no current piece uses it.

### Build must fail loudly on

- a missing required field or an unknown field
- a duplicate `number`
- more than one `featured` piece
- more than two labels, a repeated label, or an unknown label
- `Private Report` on a piece that is not gated, or a gated piece without it

### Authoring loop this schema serves

1. Finished piece exists
2. Claude returns a complete `.mdx` file with frontmatter filled in
3. File dropped in `src/content/writing/`
4. Commit and push
5. Vercel deploys, share card generates automatically

Matthew never hand-writes frontmatter and never hand-makes a share image. If either becomes manual, publishing stops happening.

When converting a finished piece, the text is carried over word for word and checked against the source with a word-count comparison. PDFs lose formatting and scramble tables, so a Word file is preferred; when only a PDF exists, tables are rebuilt from rendered page images, not from extracted text.

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
  --faint:         #798086;   /* was #5E656B, lightened in M6 to meet WCAG AA */
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

**Derived tokens.** The prototypes used several colors not in the set above. They live in a second, clearly marked block in `tokens.css`:

```css
:root {
  --text-strong:   #F2F4F6;                 /* headings, titles */
  --text-max:      #FFFFFF;                 /* hover on titles, selected text */
  --header-bg:     rgba(10,11,13,.82);      /* --bg at 82% under the blurred header */
  --accent-line:   rgba(224,155,61,.35);    /* private chip border, link underlines */
  --accent-select: rgba(224,155,61,.25);    /* text selection */
  --track:         rgba(255,255,255,.04);   /* bar chart track */
  --fill:          rgba(255,255,255,.14);   /* bar chart default fill */
  --row-tint:      rgba(255,255,255,.017);  /* index row hover, desktop */
  --accent-wash:   rgba(224,155,61,.05);    /* portrait gradient overlay */
}
```

**Every color comes from `tokens.css`.** No hex or rgba value appears anywhere else in the codebase. Build-time output that cannot use CSS variables (share cards, the favicon) reads its colors from `tokens.css` through `src/lib/tokens.ts`, so changing a token updates them too.

**Accent discipline:** the accent appears on roughly 1% of pixels. Permitted uses:

- the eyebrow label, the homepage and About kickers, and the "Section N" prefix on article H2s
- the progress bar
- the blockquote left border
- the highlighted series in a chart, or the highlighted step in a diagram
- hover state on index row numbers
- the active entry in the desktop table of contents
- the About role line, the contact mailto link, and the author block contact link
- the Erie block's left border
- the gated (Private Report) chip
- focus rings and text selection

Nothing else.

**Radius discipline:** nothing above 4px anywhere. Precision means sharp.

**Borders:** 1px hairlines, never cards with shadows.

### Type scale

| Use | Family | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Body | sans | 19.5px | 300 | 1.75 | .001em |
| Lede paragraph | sans | 21px | 300 | 1.66 | |
| H1 article | sans | clamp(34px, 6.4vw, 54px) | 600 | 1.08 | -.024em |
| H1 homepage statement | sans | clamp(33px, 7.2vw, 58px) | 500 | 1.10 | -.026em |
| H1 About and 404 | sans | clamp(31px, 6vw, 46px) | 500 | 1.12 | -.024em |
| H2 section | sans | clamp(23px, 4vw, 29px) | 500 | 1.22 | -.012em |
| H3 subhead (article) | sans | 20px | 500 | 1.3 | -.01em |
| Section number | mono | 11px | 400 | | .22em, uppercase |
| Eyebrow | mono | 11px | 400 | | .22em, uppercase |
| Metadata | mono | 11px | 400 | | .14em, uppercase |
| Section label (h2 in About) | mono | 10.5px | 500 | | .24em, uppercase |
| Chip | mono | 9.5px | 400 | | .20em, uppercase |
| Pull quote | sans | clamp(20px, 3.6vw, 24px) | 300 | 1.42 | -.01em |
| Index row title | sans | clamp(21px, 3.4vw, 26px) | 400 | 1.25 | -.014em |
| Index row title (featured) | sans | clamp(25px, 4.6vw, 34px) | 400 | 1.16 | -.02em |
| Table cell | sans | 16px | 300 | 1.5 | |
| Table header | mono | 10.5px | 400 | | .16em, uppercase |
| Figure caption | sans | 13px | 300 | 1.5 | |
| Sources list | sans | 15px | 300 | 1.55 | |

Body weight is 300, one step lighter than would be used on a light background, because dark backgrounds make type appear heavier.

Enable `font-feature-settings: "ss01","cv05"` on body.

### Motion

One effect only: sections and index rows fade up 10px over 0.7s on entry via IntersectionObserver, unobserved after firing. Chart bars animate width once on entry. Respect `prefers-reduced-motion: reduce` by disabling both, along with every hover transition.

Content is only hidden once JavaScript is known to be running (a `js` class set on `<html>` before first paint), so a reader without JavaScript sees everything. Printing shows every section regardless of whether it has faded in.

---

## 7. Page specs

### 7.1 Article page: `/writing/[slug]`

Top to bottom:

1. **Progress bar.** 1px, accent, fixed at viewport top, z-index above header. Width tracks scroll percentage.
2. **Fixed header.** See 8.1.
3. **Title block.** Mono eyebrow reading `{LABEL} / {NUMBER}` with the number in `--faint` and the label in accent. A piece with two labels joins them with a middle dot, e.g. `Organizational Study · Research / 005`. H1. Subtitle in `--muted`, max 52ch. Metadata row bounded top and bottom by hairlines, containing date (month and year), reading time, and topic, separated by 1px 9px-tall dividers.
4. **Table of contents.** Desktop (≥1080px): sticky in a 200px left column, hairline left border, active section highlighted with an accent left border and `--text` color, driven by IntersectionObserver with rootMargin `-20% 0px -70% 0px`. Mobile: a `<details>` block labeled "Contents" with a `+` / `–` affordance, bounded by hairlines, entries prefixed with their section numeral. Lists H2s only. Only renders when the piece has two or more H2s.
5. **Body.** Reading column capped at `--measure`. Paragraph bottom margin 26px.
   - The first paragraph is styled as the lede automatically. A piece that opens on a heading has no lede and starts at the same distance below the title block.
   - Bold text (`**...**`) renders at weight 400 in `--text`. A whole paragraph in bold is an emphasis line.
   - Links in body text are `--text` with a `--hair-strong` underline, no accent.
   - Bulleted and numbered lists are supported, with `--faint` markers.
6. **H2 sections.** Mono `Section {roman}` prefix stacked above the heading text in accent, added by CSS. Auto-generated `id` for TOC anchoring. A rehype plugin (`src/lib/rehypeSections.ts`) wraps each H2 and its content in a `<section>`, which drives the fade-up and the TOC active state. A piece with `sectionNumbers: false` shows its headings without the prefix.
7. **H3 subheads.** For headings below section level (e.g. the tiers inside a section, or the initiatives inside a part). No section number, not listed in the TOC.
8. **Pull quotes.** 1px accent left border, 22px left padding, 40px vertical margin.
9. **Tables.** Standard markdown tables. Mono uppercase header row in `--faint`, hairline rows, first column in `--text`. Each table sits in its own `overflow-x: auto` container; tables with four or more columns keep a 600px minimum width and scroll inside that container on a phone.
10. **Figures.** See 8.4. Numbered automatically in order (Figure 01, 02...). On desktop they break the reading column by 40px on each side.
11. **Sources.** A long piece may end with a "Sources" H2 and a numbered list wrapped in `<div className="sources">`, rendered at 15px in `--muted`. Citations in the text stay as plain bracketed numbers, e.g. [1].
12. **Author block.** See 8.6.
13. **More work.** Up to three of the newest other public pieces. Never six. Hidden when there are none. Unlisted pieces never appear here.
14. **Footer.** See 8.2.

MDX must support `<Figure>`, `<BarChart>` and `<LoopDiagram>` without per-file imports.

### 7.2 Homepage: `/`

Doubles as the writing index. There is no separate index page and no `/writing` route listing.

1. **Statement block.** Mono kicker "Work. Achieve. Repeat." in accent. H1 statement, max 30ch, with large padding above and below. Supporting paragraph in `--muted`, max 44ch. No image, no hero, no graphic.
2. **Index header.** Mono row: "Selected work" left, year right. The year is that of the newest listed piece.
3. **Rows.** Desktop grid of `62px | 1fr | 128px` for number, content, date. Mobile stacks to a single column with the date last. Each row: mono number in `--faint` turning accent on hover, one chip per label, title, subtitle max 56ch, optional `origin` line. The chip, title, subtitle and origin stack vertically. (The homepage prototype rendered them inline on one line because its spans were never made block level; this spec wins.) Hairline below each row, `--hair-strong` above the first. Row hover tints the background by 1.7% white on desktop only. Gated rows are not links and have no hover.
4. **Featured row.** Larger title. One maximum.
5. **Order.** The featured piece first, then every other listed piece in number order.
6. **Footer.**

No cap on row count. The index scrolls indefinitely as work accumulates. An archive that keeps going is a feature.

### 7.3 About: `/about`

Order is deliberate. Credentials come before publication types, because credentials answer "should I keep reading."

1. Mono "About" kicker, H1 statement, lede paragraph, one supporting paragraph.
2. **Who writes this.** 172px square portrait, 1:1, hairline border, `filter: grayscale(1) contrast(1.05) brightness(.95)` applied in CSS so any supplied photo is desaturated automatically. Faint crosshair grid overlay. The photo lives at `src/assets/portrait.jpg` and is optimized to 344px at build; without a photo, a placeholder renders. Name, mono role line in accent ("Founder, WAR Sports Group"), then Matthew's bio in five paragraphs. Desktop layout is a `172px | 1fr` grid with 38px gap; stacks on mobile.
3. **Background.** Spec table, `38%` label column in mono uppercase `--faint`, value column at 16.5px. Hairlines between rows and above the first. Rows: current role, scouting (with territory), education, certification, focus areas.
4. **What gets published here.** One row per label with a chip and a one-line description, including Private Report with the private chip.
5. **In progress.** The Erie block: surface panel, 1px hairline border with a 1px accent left border, `FICTION` chip, mono "Coming soon" status, italic title, one paragraph. See open items regarding its lifecycle after publication.
6. **Contact.** One line stating what he is open to, then a mono accent mailto link, then an "Elsewhere" row of mono uppercase links (RWDH, LinkedIn, X). Only links with a URL render. Matthew's own profiles carry `rel="me"`.
7. **Footer.**

Every section rule on this page stops at the text column, for consistency. (In the prototype, two of them ran the full page width.)

### 7.4 404

- Mono `404` in accent
- One line of copy with some personality: "That page isn’t on the roster."
- One link back to the index
- Same header, footer, and tokens as every other page
- `noindex`, no canonical URL
- Nothing else

---

## 8. Components

### 8.1 SiteHeader
Fixed, full width, `--header-bg` with `backdrop-filter: blur(12px)`, 1px hairline bottom border. Inner bar max `--shell`, 13px vertical padding. Left: wordmark, the 20px WAR Sports Group mark in `--text` plus mono `WAR` at weight 500 followed by `Sports Group` in `--faint`. Right: a single mono uppercase nav link. On the homepage that link is "About"; on About it is "Writing"; on an article it is "About".

**The mark** is a thin precision crosshair (logo concept 4, chosen November 2026): an outer ring, a small inner ring, cross lines that stop short of the inner ring, and a fine center plus. It is monochrome. It is defined once, as SVG geometry in `src/lib/mark.ts`, and drawn from there by the header (`Mark.astro`), the share cards and the favicon. It comes in two weights:

- **Regular:** the header and share cards. Its line weight matches the site's hairlines.
- **Heavy:** the favicon only. Thicker strokes and no center plus, so it stays crisp at 16px, where the regular hairlines would fade.

The geometry is a redraw from the concept image. If a designer supplies a vector file, replace the paths in `src/lib/mark.ts` and every use updates.

Nav and footer links have enlarged tap targets (about 40px tall) through padding offset by negative margin, so nothing moves visually.

### 8.2 SiteFooter
Hairline top border. Mono uppercase row, space-between, wrapping on mobile: "WAR Sports Group", the same nav link as the header, "Contact" (to `/about#contact`), copyright year. No newsletter, no social icon set.

### 8.3 Chip
Inline mono uppercase, 1px `--hair-strong` border, 2px radius, 3px/7px padding. Variant `private` uses an `--accent-line` border and accent text. A piece with two labels shows two chips side by side.

### 8.4 Figure
Surface background, 1px hairline border, 3px radius, 26px/22px padding. Contains a mono "Figure NN" label in `--faint` (numbered automatically), a 16.5px title, the visual, and an optional caption above a hairline top border at 13px in `--faint`.

### 8.5 BarChart (house data style)
Horizontal bars. Track is `--track`, 22px tall, 2px radius. Default fill `--fill`. One series may be flagged `highlight` and uses the accent. Value labels in mono 11px, right-aligned inside the track. Series names above each bar in mono 10.5px uppercase `--muted`. Bars animate width once on scroll entry over 1.1s.

This is the house chart identity. Grayscale by default, accent reserved for the single data point being argued about, mono labels throughout. Every future chart type added to the site must follow the same rules.

### 8.6 AuthorBlock
`--hair-strong` top border, 34px top padding. Mono "Author" label, 22px name, one paragraph in `--muted` at 16.5px naming his current roles, then a mono accent "Get in touch" mailto link with a translucent accent underline.

This is the conversion point of the site. Treat it as a section, not a footnote.

### 8.7 LoopDiagram
A closed loop of steps, used inside a `<Figure>`. Follows the house chart rules: steps are hairline boxes on `--bg`, arrows in `--faint`, mono step numbers, and the accent reserved for the single step being argued for (`highlight`). Steps run top to bottom with a return arrow on the left, so labels stay readable on a phone; a ring layout would shrink to unreadable text at 320px. Each step has a title and optional detail lines.

### 8.8 Table
`MDX` tables render through `Table.astro`, which wraps each one in its own horizontal scroll container. See 7.1.

---

## 9. Share cards

Auto-generated Open Graph images at build time, 1200x630, using `satori` and `@resvg/resvg-js`. One card per page: `/og/home.png`, `/og/about.png`, and `/og/writing/<slug>.png` for every piece with a page (including unlisted pieces).

Card composition, matching site tokens:
- `--bg` background
- Mono eyebrow `{LABEL} / {NUMBER}` in accent (two labels joined with a middle dot). The homepage and About cards use their kickers.
- Title in Inter 600, wrapped, dominant. Size steps down for longer titles; clamped to three lines.
- Subtitle in `--muted`, two lines maximum
- Bottom row: the mark (regular weight) plus `WAR SPORTS GROUP` in mono uppercase
- A single accent line along the top edge

Every page also has `og:title`, `og:description`, `og:image` (with width, height and alt), `og:url`, `twitter:card` set to `summary_large_image`, and a canonical URL. Articles add `og:type=article` and `article:published_time`. The 404 has no canonical URL and uses the homepage card.

Page titles read `Title · WAR Sports Group`, or just `WAR Sports Group` on the homepage.

The share card is the first impression, before the site even loads. It matters as much as any page. After a card changes, run the URL through LinkedIn's Post Inspector to refresh the cached preview.

---

## 10. Quality targets

- Lighthouse 95+ on all four categories, mobile. Measured at 100 on all four for an article page after M6.
- Zero cumulative layout shift. Self-host fonts, `font-display: swap` with the two main faces preloaded, explicit image dimensions.
- Total shipped JS under 5kb
- Fully usable at 320px width
- No horizontal body scroll at any width. Wide content scrolls inside its own `overflow-x: auto` container.
- Visible focus states on every interactive element: a 1px accent outline offset 3px on `:focus-visible`
- Semantic headings in order, one H1 per page
- Text contrast meets WCAG AA against `--bg` and `--surface` (this is why `--faint` was lightened)
- `sitemap.xml` and `robots.txt` generated, with `unlisted` pieces excluded from the sitemap

---

## 11. Build milestones

Work one milestone at a time. Deploy at the end of each. All six are complete.

**M1. Scaffold and deploy.** Astro project, content collection and zod schema, tokens.css, self-hosted fonts, BaseLayout, SiteHeader, SiteFooter, live on Vercel with a placeholder homepage.

**M2. Article template.** ArticleLayout, full typography, progress bar, TOC desktop and mobile, section numbering, pull quotes, Figure, BarChart, AuthorBlock, MoreWork. Load one real long piece and verify on a phone.

**M3. Homepage index.** Statement block, IndexRow, featured variant, all three visibility states behaving correctly.

**M4. About and 404.** Portrait treatment, spec table, publication types, Erie block, contact, plus the 404.

**M5. Share cards and metadata.** OG image generation, full meta tags, sitemap, robots, favicon.

**M6. Polish.** Mobile pass at 320px, reduced-motion pass, focus states, Lighthouse, real content load. Domain is already connected and valid, so no DNS work remains.

---

## 12. Open items

**Still open**

1. **Erie lifecycle.** "Coming soon" has a shelf life. At publication the block either becomes a single line with a purchase link or Erie gets its own page. The pen name has been scrapped, so linking the book under Matthew's own name is viable.

**Resolved**

- **Logo.** Concept 4, the thin crosshair, with a heavier version for the favicon. See 8.1.
- **Accent color.** `#E09B3D` stays. The mark is monochrome, so nothing needs to match it.
- **Portrait.** A studio headshot is in place, desaturated by CSS. An in-rink photo in a dark environment would still suit the design better if one becomes available.
- **Employer naming.** Named: Buffalo Wild Wings Arena in Troy, Michigan, and the Toledo Cherokee of the NCDC.
- **Ambition line.** Dropped with Matthew's own bio.
- **Contact address.** `matthew@warsportsgroup.com` is wired into the About page and the author block.
- **Bio and Erie copy.** Both replaced with Matthew's own.
- **Gated state.** Kept for future private work, along with the Private Report row on About. No current piece is gated.
- **Launch inventory.** Five public pieces are live.
- **The Pattern Is the Answer, full text.** Piece 002 is the complete piece as published at RWDH on April 12, 2026.

---

## 13. Standing rules

- No em dashes in any copy anywhere on the site, or anywhere else in the project.
- Restraint is the aesthetic. If a decision is between adding something and removing something, remove.
- Every addition to V1 scope past this document is a V2 item unless explicitly agreed.
- Ask before adding a dependency.
- Never touch DNS, nameservers, MX records, or TXT records.

---

## 14. Decisions made during the build

Recorded so a future session does not undo them. Each was agreed with Matthew.

| Decision | Why |
|---|---|
| `--faint` changed from `#5E656B` to `#798086` | The original measured 3.33:1 against `--bg`, failing the WCAG AA target in section 10. The new value is 4.92:1 on `--bg` and 4.52:1 on `--surface`. |
| Derived color tokens added to `tokens.css` | The prototypes used colors outside section 6; keeping every color in one file required naming them. |
| Collection config at `src/content.config.ts` | Astro 7 no longer reads `src/content/config.ts`. |
| `@astrojs/markdown-remark` added | Astro 7's default Markdown processor skips rehype plugins, and the section wrapper needs one. |
| `visibility` required with no default | Frontmatter is generated, so a missing value should fail the build rather than silently become public. |
| `label` accepts up to two values | Operating Unlike Any Other Team is both an Organizational Study and Research. It stays within the one label field, not a tag system. |
| `sectionNumbers` frontmatter flag | Operating Unlike Any Other Team has its own Part I to VI numbering, which its text cross-references; automatic section labels would have collided with it. |
| Homepage rows stack vertically; kicker in accent | The prototype's inline rows and gray kicker were CSS bugs; section 7.2 describes stacked rows and an accent kicker. |
| Homepage order is featured first, then number order | Keeps the display numbers reading in sequence. Numbers follow publication order. |
| Footer repeats the header's nav link and adds Contact | The three prototype footers differed; one shared component needed one rule. |
| Canonical host is `www`, no trailing slash | Matches how Vercel serves the domain. |
| CSS inlined into each page | Removes render-blocking requests; readers usually land on a single page from a shared link. |
| Favicon generated from `tokens.css` | A static SVG would have put hex colors outside `tokens.css`. |
| Logo concept 4, with a heavy favicon weight | Of the concepts, its line weight matches the site best in the header and on share cards; the heavy weight fixes its one weakness, legibility at 16px. Concepts with lettering inside the mark were illegible at header size. |
| Bar chart value labels sit at the right end of the track | Section 8.5 says right-aligned inside the track; the prototype placed them at the end of the bar. |
| Tables, H3 subheads, sources list and LoopDiagram added | Needed by the longer pieces. All are opt-in per piece and follow the house rules. |
