# Master SEO Prompt — procalculator.site (Unit Conversion Content Gap)

Paste everything below the line into a fresh Claude Code session opened at
`~/July Projects/procalculator-site`.

---

## PROMPT START

You are doing SEO content work on my site **procalculator.site**, a static
HTML calculator directory (no framework — plain HTML pages, prerendered via
`scripts/prerender.mjs`, deployed on Vercel). Read this entire brief before
touching any files.

### Background / why this work exists

My direct competitor, **procalculator.co.uk**, ranks for 328 long-tail
keywords across exactly 5 dedicated unit-conversion pages:

| Competitor page | Cluster | Keywords ranking |
|---|---|---|
| `/lbs-to-stone/` | Pounds/LBS to Stone | 251 |
| `/pints-to-ml/` | Pints to ML | 28 |
| `/kg-to-stone/` | KG to Stone | 17 |
| `/litres-to-gallons/` | Litres to Gallons | 17 |
| `/g-to-ml/` | Grams to ML | 15 |

The full keyword list (keyword, current top position on competitor's site,
search intent) is saved at:
- `procalculator-keyword-clusters.csv` (long format: Cluster, Keyword, Top
  Position, Intent)
- `procalculator-keyword-clusters-wide.csv` (one column per cluster)

**My site currently has zero dedicated pages for any of these 5 topics.**
The closest thing is `calculator/unit-converter.html`, a generic
length/weight/temperature converter (~690 words, no stone/pint/litre/gram
depth, no volume conversions at all). This is the single biggest content
gap between my site and the competitor — read that file first to see what
NOT to duplicate.

### Competitor content benchmark (what "winning" looks like)

I fetched two of their live pages. Match or exceed this depth on every new
page — do not ship thin pages:

- **Word count:** ~2,400–2,600 words per page (my existing calculator pages
  average 700–900 words — that's the gap to close)
- **Heading structure:** 1 H1, 8–9 H2 sections, ~9–10 H3 subsections
- **Sections present on their `/lbs-to-stone/` page** (use this as the
  template for structure, not the exact copy):
  1. Intro paragraph defining the unit and why it matters in the UK
  2. Interactive calculator tool
  3. Quick Conversions (6 common highlighted values)
  4. Common Conversions table (structured reference table)
  5. Conversion Formula and Method (formula stated plainly + step-by-step
     worked example)
  6. Body Weight / real-world comparison examples (demographic or practical
     reference points, adapted per unit type)
  7. Detailed/extended conversion table (wide range, fine granularity)
  8. Historical Context (origin of the unit, standardising legislation —
     e.g. Weights and Measures Act 1835/1985 for stone, Weights and
     Measures Act 1824 for the imperial pint)
  9. Cultural/practical usage section (UK-specific context: bathroom
     scales, boxing weight classes, draught beer pints, cooking, etc.)
  10. Accuracy/precision note
  11. FAQ section — **8 questions minimum**, schema-marked
- **Internal linking:** each page links to ~6 related converter pages
  (e.g. the lbs-to-stone page links to kg-to-stone, kg-to-lbs,
  km-to-miles, cm-to-feet, fahrenheit-to-celsius, cm-to-inches)
- **Entities/topics they cover that I must also cover:** UK vs US unit
  differences (US pint ≠ UK pint, etc.), relevant legislation, geographic
  scope (UK, Ireland, and where relevant US/Australia/Canada/NZ usage),
  practical/cultural applications, both the base unit and its everyday
  colloquial use.

### Content quality bar — semantic / entity-based / NLP-aware writing

This is the core instruction, follow it on every page:

1. **Write for entities and topical coverage, not keyword density.** Do not
   stuff exact-match keywords repeatedly. Instead, comprehensively cover
   every entity, sub-topic, and related concept a topical authority on
   "pounds to stone conversion" (etc.) would naturally include — the unit's
   definition, its formula, its history, its legal status, its regional
   usage, comparable/adjacent units, common real-world reference points,
   and the natural-language questions people actually ask.
2. **Use the keyword CSV as an intent map, not a copy-paste list.** Group
   each cluster's keywords by underlying search intent (e.g. within
   lbs-to-stone: "convert a specific weight" queries like `200 pounds in
   stone`, vs "what is X" definitional queries, vs conversational phrasing
   like `how much is 120 lbs in stone`). Every distinct phrasing pattern in
   the CSV should be answerable somewhere on the page — in the quick-convert
   table, the FAQ, or the body copy — in natural sentence form, not as a
   bolted-on keyword.
3. **Cover query variants naturally in prose and headings**: singular vs
   plural (pound/pounds), symbol vs word (lb/lbs/lb.), "X in Y" vs "X to Y"
   vs "convert X to Y" vs "how many Y in X", decimal inputs (e.g. `63.5kg`,
   `129.6 lbs`), and combined-unit answers ("stone and pounds" not just
   decimal stone).
4. **Answer the FAQ questions in a way a featured-snippet extraction would
   favor**: a direct 1–2 sentence answer immediately after the question,
   optionally followed by elaboration.
5. **Use semantically related vocabulary throughout**: for weight —
   imperial, metric, avoirdupois, body weight, mass; for volume — imperial
   pint, US pint, fluid ounce, litre, millilitre, draught, capacity; for
   the gallons page — US gallon vs UK/imperial gallon distinction is
   critical since they differ by ~20%.
6. **No AI-generic filler.** Every sentence should carry a real fact,
   number, or answer. No "In today's world, understanding conversions is
   more important than ever" style padding.

### Pages to build

Create these 5 new calculator pages (final slugs are your call, but keep
them short and keyword-aligned — e.g. `lbs-to-stone`, `kg-to-stone`,
`pints-to-ml`, `litres-to-gallons`, `g-to-ml`):

1. **Pounds/LBS to Stone** — target the 251 keywords in that cluster.
   Needs live bidirectional conversion (lbs → stone, and stone+lbs → lbs),
   since many queries are "X stone Y pounds in lbs" in reverse.
2. **KG to Stone** — 17 keywords, several with decimals (63.5kg, 82.6kg,
   95.3kg) — tool must handle decimal kg input cleanly.
3. **Pints to ML** — 28 keywords. Must explicitly support and disambiguate
   UK/imperial pint (568.26ml) vs US pint (473.18ml) since several queries
   ask about this directly.
4. **Litres to Gallons** — 17 keywords, all UK-flagged — must use the
   UK/imperial gallon (4.546 L), not the US gallon (3.785 L), and should
   call that out explicitly since it's a common source of wrong answers
   elsewhere on the web (a content differentiation opportunity).
5. **Grams to ML** — 15 keywords, several cooking-context ("gm to ml
   flour", "100g in ml for flour"). Note for accuracy: g-to-ml is a
   density-dependent conversion (1g = 1ml only for water); either scope
   the tool/copy explicitly to water-equivalent volume, or add a clear
   caveat about density for cooking ingredients — do not silently imply
   grams and ml are always interchangeable.

### Technical implementation — read these files before writing code

- `assets/js/tools-data.js` — single source of truth for calculator
  metadata (`CATEGORIES` and `TOOLS` arrays). Add one `TOOLS` entry per new
  page (id, title, category, icon, badge, functional, desc, tags). The
  `science` category (`Units, physics & conversions`) is the natural home
  unless you find a better fit.
- `scripts/prerender.mjs` — regenerates the static card grids on the
  homepage and `calculators/*.html` category pages from `tools-data.js`.
  **Run `node scripts/prerender.mjs` after editing `tools-data.js`.**
- `calculator/bmi.html` and `calculator/unit-converter.html` — use as the
  structural/schema template (both already implement `ld-breadcrumb`,
  `ld-faq`, and `ld-webapp` JSON-LD blocks). Match that schema pattern on
  every new page — `WebApplication`, `FAQPage` (with ALL FAQ Q&As included,
  not a subset), and `BreadcrumbList`.
- `vercel.json` — confirms clean URLs (`/calculator/:tool` rewrite), so new
  pages are simply new files at `calculator/<slug>.html`.
- `sitemap.xml` — add a `<url>` entry for each new page after creating it.
- Title tag pattern to follow (matches existing site convention): `<Primary
  Keyword Phrase> · Pro Calculator UK` or similar — check 2–3 existing
  titles in `calculator/*.html` and stay consistent.
- Meta description: unique per page, under 160 characters, includes the
  primary conversion and a concrete number example.

### Process

1. Read `procalculator-keyword-clusters.csv` fully — group keywords by
   intent per cluster as described above.
2. Read `calculator/bmi.html` and `calculator/unit-converter.html` in full
   to learn the existing HTML/CSS/JS/schema conventions (don't invent a new
   pattern — extend the existing one).
3. Build the 5 pages one at a time. For each: write the page, add its
   `tools-data.js` entry, and verify locally before moving to the next.
4. After all 5 are added to `tools-data.js`, run `node scripts/prerender.mjs`
   once to update the homepage/category grids.
5. Add all 5 URLs to `sitemap.xml`.
6. Add cross-links: each new page should link to the other 4 new pages
   where topically relevant (e.g. kg-to-stone ↔ lbs-to-stone), plus to
   `unit-converter.html` for other conversion types.
7. Spot-check: word count ≥ 2,000 words per page, FAQ schema present with
   ≥ 8 Q&As, no broken internal links, `git status` reviewed before any
   commit.

Do not deploy/push without showing me the finished pages first.

## PROMPT END
