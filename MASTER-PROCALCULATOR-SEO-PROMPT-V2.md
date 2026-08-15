# Master SEO Implementation Prompt — procalculator.site (Audit Round 2)

Paste everything below the line into a fresh Claude Code session opened at
`~/July Projects/procalculator-site`.

---

## PROMPT START

You are doing SEO implementation work on my site **procalculator.site**, a
static HTML calculator directory (no framework — plain HTML pages,
prerendered via `scripts/prerender.mjs`, deployed on Vercel). Read this
entire brief before touching any files.

### Background

Two audit passes were just completed against this site:
1. A technical/on-page/off-page crawl of procalculator.site itself.
2. A topical-authority and search-intent pass cross-referencing
   `procalculator-keyword-clusters.csv` (328 keywords, 5 clusters, exported
   from a competitor gap analysis) against a live crawl of the direct
   competitor, **procalculator.co.uk**.

Full findings and reasoning are written up here — read it first, it has
the "why" behind every task below:
https://claude.ai/code/artifact/461a7880-3f22-47b4-8616-5b0a82d0afd7

Key facts from that audit you need as background:
- procalculator.co.uk has **1,256 indexed pages** (its own sitemaps:
  `post-sitemap.xml` = 1,000 URLs, `post-sitemap2.xml` = 256 URLs) against
  this site's 84 — a ~15x page-count gap on the identical brand name.
- The competitor's `lbs-to-stone` page links to and from 8 sibling
  conversion pages: `kg-to-lbs`, `kg-to-stone`, `cm-to-feet`,
  `cm-to-inches`, `fahrenheit-to-celsius`, `km-to-miles`, `inch-to-mm`.
  None of those exist as dedicated pages on procalculator.site — only thin
  mentions inside the generic `unit-converter.html`.
- The 5 pages built in the previous round (`lbs-to-stone.html`,
  `kg-to-stone.html`, `pints-to-ml.html`, `litres-to-gallons.html`,
  `grams-to-ml.html`) hit their content-depth brief (2,000–2,450 words, 13
  H2s, 10 FAQ Q&As each) but are content-isolated — they only link to each
  other plus the generic converter, not to a real surrounding cluster.
- `lbs-to-stone.html` is the highest-value page (251 of the 328 keywords)
  but only covers 39 of the 126 distinct numbers actually searched for, and
  has zero decimal examples in static text despite 12 decimal queries in
  the CSV (129.6 lbs, 179.2 lbs, etc.).
- Site-wide: no `og:image`/`twitter:image` on any of the 84+ pages, and
  every calculator page loads the full 148KB `calculators.js` bundle
  (logic for all 84 calculators) instead of just its own.

Do the tasks below in order. Show me each finished page before moving to
the next category of work. **Do not deploy/push without showing me the
diff first.**

---

### Task 1 — Fix `lbs-to-stone.html` to match actual keyword demand (content edit only)

This is the single highest-leverage content fix in the audit. No new
pages, no structural changes — just widen the existing tables.

1. Read `calculator/lbs-to-stone.html` in full.
2. Its "Quick Conversions" and "Extended stone-to-pounds table" sections
   currently step through round, evenly-spaced values. Rework them (adding
   rows/values, not replacing the format) to explicitly include these 87
   specific numbers that appear in real search queries but are currently
   missing from the page's static text:

   20, 22, 25, 30, 33, 40, 44, 52, 60, 80, 85, 90, 104, 107, 113, 115, 117,
   118, 121, 122, 123, 125, 127, 129, 131, 134, 135, 136, 138, 142, 143,
   144, 145, 146, 148, 149, 153, 155, 156, 157, 158, 159, 162, 163, 166,
   169, 173, 174, 177, 179, 181, 183, 185, 186, 188, 191, 192, 194, 197,
   198, 202, 205, 207, 208, 211, 212, 214, 215, 216, 218, 222, 223, 225,
   226, 235, 243, 246, 261, 265, 285, 303, 330, 350, 450, 500, 700, 800

3. Add a short new sub-section (or extend "Worked example") covering these
   11 exact decimal queries people search — give each a stated answer in
   prose, not just table rows: 129.6 lbs, 138.6 lbs, 146.8 lbs, 147.8 lbs,
   166.6 lbs, 173.8 lbs, 175.4 lbs, 179.2 lbs, 179.4 lbs, 192.6 lbs, 197.8
   lbs — each converted to stone and pounds.
4. Keep the interactive calculator as-is; this task is purely about making
   sure the static HTML text contains the literal number+answer pairs
   Google can lift into a snippet, on top of what the calculator already
   does live.
5. Verify: no duplicate table structure introduced, word count only grows,
   FAQ schema untouched.

### Task 2 — Build the 7 missing adjacent conversion pages

These close the topical-authority/cluster gap: they don't come from the
keyword CSV (that export only covered the original 5 clusters), so treat
keyword targeting for these as directionally obvious from the unit pair
itself, not CSV-sourced. Match the same content and schema standard as the
existing 5 pages (see Task 3 for the template).

Build these 7 pages at `calculator/<slug>.html`:

1. `kg-to-lbs` — Kilograms to Pounds
2. `cm-to-feet` — Centimetres to Feet (and inches)
3. `cm-to-inches` — Centimetres to Inches
4. `fahrenheit-to-celsius` — Fahrenheit to Celsius (bidirectional with
   Celsius to Fahrenheit on the same page)
5. `km-to-miles` — Kilometres to Miles
6. `inch-to-mm` — Inches to Millimetres
7. `stone-to-kg` — Stone to Kilograms (the reverse of the existing
   `kg-to-stone.html` — bidirectional tool, don't just duplicate that
   page's content)

For each page:
- 2,000+ words, matching the structure already established in
  `lbs-to-stone.html` / `kg-to-stone.html`: definition + why it matters,
  live bidirectional calculator, Quick Conversions, Common Conversions
  table, Conversion Formula and worked example, real-world reference
  points, extended table, historical/standards context where relevant
  (e.g. metrication, SI units), accuracy note, FAQ (8+ Q&As, schema-marked).
- No AI-generic filler — every sentence carries a fact, number, or answer.
- Unique title/meta description under 160 characters with a concrete
  worked example, following the existing title pattern (`<Primary Keyword
  Phrase> · Pro Calculator UK`).

### Task 3 — Interlink the full 12-page conversion cluster

This is what actually closes the topical-authority gap — it doesn't work
without this step.

1. Every one of the 12 conversion pages (the original 5 +
   the 7 new ones) should link to the other conversion pages that are
   topically adjacent to it — mirror procalculator.co.uk's pattern where
   `lbs-to-stone` links to `kg-to-lbs`, `kg-to-stone`, `cm-to-feet`,
   `cm-to-inches`, `fahrenheit-to-celsius`, `km-to-miles`, `inch-to-mm` (7
   links) plus one unrelated high-value cross-sell.
2. Update the "Related calculators" block on each of the 5 existing pages
   to include the relevant new pages, not just the other 4 from the
   original build.
3. Add a "Related calculators" block (or reuse the existing pattern) to
   each of the 7 new pages linking back to the 5 existing ones where
   topically relevant, plus to `unit-converter.html`.

### Task 4 — Technical implementation notes (read before writing code)

Same conventions as the previous build — don't invent a new pattern:
- `assets/js/tools-data.js` — add one `TOOLS` entry per new page (id,
  title, category, icon, badge, functional, desc, tags). Science category
  is the natural home, matching the original 5.
- `scripts/prerender.mjs` — run `node scripts/prerender.mjs` once after
  all 7 new pages are added to `tools-data.js`, to regenerate the
  homepage/category card grids.
- `calculator/bmi.html` and `calculator/lbs-to-stone.html` — use as the
  structural/schema template (`WebApplication`, `FAQPage` with ALL Q&As,
  `BreadcrumbList`).
- `vercel.json` already handles clean URLs — new pages are just new files
  at `calculator/<slug>.html`.
- `sitemap.xml` — add a `<url>` entry for each of the 7 new pages.

### Task 5 — Site-wide technical fixes (independent of Tasks 1–3)

These were flagged in the technical pass and are unrelated to the content
cluster work — do them whenever convenient, they touch the shared template
rather than individual calculator pages:

1. Add a default `og:image` and `twitter:image` to the shared page
   template (whatever generates the `<head>` block across all
   `calculator/*.html` files) — a single site-wide image is enough as a
   baseline; per-category images are a nice-to-have, not required.
2. Trim the title tag on `calculator/pints-to-ml.html` — currently 61
   characters ("Pints to ML Calculator (UK & US Pint) · Pro Calculator
   UK"), needs to be under 60. Suggest shortening "(UK & US Pint)" to
   "(UK/US)".
3. Split `assets/js/calculators.js` (currently one 148KB file with all 84
   calculators' logic loaded on every single calculator page) so each page
   only loads its own calculator's code — either per-calculator files or a
   build step that extracts just the relevant function. Check
   `scripts/prerender.mjs` first to see if there's already a build step
   this can hook into, rather than hand-splitting 84 functions.

### Reference links

- Full audit report (this session's findings, read first):
  https://claude.ai/code/artifact/461a7880-3f22-47b4-8616-5b0a82d0afd7
- Direct competitor: https://procalculator.co.uk/ — see
  `https://procalculator.co.uk/lbs-to-stone/` specifically for the
  cluster-linking pattern Task 3 is matching.
- Keyword source: `procalculator-keyword-clusters.csv` and
  `procalculator-keyword-clusters-wide.csv` in this repo.
- Original build brief (for pages 1–5, already shipped, kept for
  reference on schema/content conventions):
  `MASTER-PROCALCULATOR-SEO-PROMPT.md` in this repo.

Do not deploy/push without showing me the finished pages first.

## PROMPT END
