# CLAUDE.md

Working rules for Claude Code on the warsportsgroup.com project.

## Read first

`SPEC.md` in the repo root is the source of truth for this build. Read it before writing any code. If something in this file and SPEC.md conflict, SPEC.md wins.

Visual reference prototypes live in `design-reference/`. They are approved single-file HTML mockups of the article page, homepage, and About page. Match their look exactly. Do not treat their code structure as the target architecture: they are flat HTML files, and the build reimplements them as proper Astro components.

## How we work

- **One milestone at a time.** SPEC.md section 11 lists M1 through M6. Build only the milestone asked for. Do not start the next one, do not scaffold ahead, do not "while I'm in here" extra features.
- **Deploy at the end of each milestone.** Commit, push to `main`, confirm the Vercel build succeeded.
- **Ask before adding a dependency.** This site should have almost none.
- **Stop and ask if the spec is silent on something that matters.** Do not invent a solution to a design question that has not been decided.

## Hard constraints

- **No em dashes** in any copy, comment, commit message, or content anywhere in this project. Use commas, periods, colons, or sentence breaks.
- **Dark only.** No light mode, no theme toggle, no `prefers-color-scheme` handling.
- **No localStorage, sessionStorage, or client-side state.** This is a static publishing site.
- **Accent color discipline.** `--accent` appears on roughly 1% of pixels. The permitted uses are listed in SPEC.md section 6. Nothing else.
- **No radius above 4px.** Hairline borders, never shadowed cards.
- **Every token comes from `tokens.css`.** No hardcoded hex values anywhere else in the codebase.
- **The non-goals list in SPEC.md section 2 is binding.** Search, tags, pagination, comments, newsletter, and a CMS are not "nice to haves for later," they are out.

## Environment

- Astro, static output, no adapter. The site must build to plain files.
- Deployed on Vercel, auto-deploy on push to `main`. Build command `npm run build`, output `dist`.
- Domain `warsportsgroup.com` is already connected and valid.
- **Never touch DNS, nameservers, MX records, or TXT records.** Google Workspace email runs on this domain. DNS work is done and off limits.

## Content

- Articles are MDX files in `src/content/writing/`.
- The schema is defined in SPEC.md section 5, including the `public` / `gated` / `unlisted` visibility states.
- Frontmatter is generated, never hand-written by the author. If the schema changes, keep it easy to produce a complete file in one paste.

## Quality bar

Before calling a milestone done:

- Check it at 320px, 390px, and desktop width
- No horizontal body scroll at any width
- No layout shift on load
- Visible focus states on interactive elements
- `prefers-reduced-motion` respected

The article page is the most important page on the site. It gets the most scrutiny.
