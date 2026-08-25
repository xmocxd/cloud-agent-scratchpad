# Episode 1 — Foundations: Outline

**Target runtime:** ~60 minutes (acceptable band 45–75)  
**Sources:** [../research/sources.md](../research/sources.md)  
**Methodology:** [../METHODOLOGY.md](../METHODOLOGY.md)

## Section map

| # | Section | Est. minutes | Ends with |
|---|---------|--------------|-----------|
| 0 | Cold open + syllabus | 3 | Journey map |
| A | Why Astro exists | 8 | `[RECAP]` |
| B | Mental model of a page | 7 | `[RECAP]` |
| C | Astro components | 10 | `[RECAP]` + `[REVIEW: server-first / zero JS]` |
| D | Islands architecture | 9 | `[RECAP]` + `[REVIEW: fence vs template]` |
| E | Client directives | 7 | `[RECAP]` + `[REVIEW: client vs server island decision]` |
| F | Routing basics | 8 | `[RECAP]` + `[REVIEW: islands on a static page]` |
| G | Content collections intro | 8 | `[RECAP]` + `[REVIEW: getStaticPaths + collections]` |
| H | Closing synthesis + self-check | 5 | Interleaved final review |

## Spaced-repetition beat schedule

| ID | Placement | Revisits | Form |
|----|-----------|----------|------|
| R1 | After C | Server-first; zero JS by default | “Remember earlier…” + one decision question |
| R2 | After D | Component script fence vs template | Re-apply: where would fetch/secret code live? |
| R3 | After E | Client island vs server island | Decision tree with a product-page scenario |
| R4 | After F | Islands | “A blog post page is mostly HTML—where do widgets go?” |
| R5 | After G | `getStaticPaths` | “You have fifty posts in a collection—what does this function return?” |
| R6 | Section H | All major concepts | Three self-check questions, then spoken answers |

Additional light callbacks (not full review beats): after B mention of build vs request time; after F contrast with on-demand (no deep SSR yet).

## Beat-by-beat outline

### 0. Cold open + syllabus
- Hook: marketing site that feels like a heavy app; JS tax; SEO and first paint.
- Promise: listen without looking; leave with mental models, not a typed-out tutorial.
- Syllabus A→H in one breath each.
- `[PAUSE]`

### A. Why Astro exists
- Job: content-driven websites (blogs, docs, marketing, e-commerce storefronts).
- Five principles (spoken): content-driven, server-first, fast by default, easy to use, developer-focused.
- Contrast: SPA frameworks optimized for app-like UIs vs Astro optimized to showcase content quickly.
- Features as names only: islands, UI-agnostic, zero JS default, content collections.
- Common mistake: “Astro replaces React for dashboards” — clarify fit.
- `[RECAP A]`

### B. Mental model of a page
- Three times: **build time**, **request time**, **browser time**.
- Default path: prerender HTML at build; ship HTML/CSS; little or no JS.
- Opt-in path: adapter + on-demand for personalized/dynamic routes (name only; deep later).
- Hold idea: most of the page can be a static shell.
- `[RECAP B]`

### C. Astro components
- `.astro` = HTML-first templating; no client runtime by default.
- Moving parts: **component script** (fence) + **component template**.
- Script jobs: import, fetch, prepare data, read props (`Astro.props`).
- Template jobs: HTML output; expressions; compose other components.
- Props and slots (default, named, fallback) as composition tools.
- Layouts = components wrapping page content via slots.
- `[RECAP C]`
- `[REVIEW: R1 server-first / zero JS]`

### D. Islands architecture
- Sea of static HTML; islands as bounded enhancements.
- **Client island:** hydrate interactive UI in the browser.
- **Server island:** deferred server HTML for personalized/dynamic bits (`server:defer`).
- Selective hydration vs hydrate-the-whole-app.
- Isolation: islands load independently; frameworks can mix because islands are separate.
- `[RECAP D]`
- `[REVIEW: R2 fence vs template]`

### E. Client directives
- Default: framework component → HTML only, no hydrate.
- Spoken API cards: load, idle, visible, media, only.
- Decision rule: urgency of interactivity + cost of JS.
- Note: `client:only` needs framework name; skips server HTML for that component.
- `[RECAP E]`
- `[REVIEW: R3 client vs server island]`

### F. Routing basics
- Pages folder under source maps files to URLs.
- Static files → static routes; brackets → dynamic params.
- Spoken API card: `getStaticPaths` — returns list of param (and optional props) objects for prerendered dynamic routes.
- On-demand dynamic routes: match at request time; no `getStaticPaths` (contrast only).
- Navigate with normal links.
- `[RECAP F]`
- `[REVIEW: R4 islands on mostly-static page]`

### G. Content collections intro
- Why: organize related structured content; validate shape; query with content APIs.
- Moving parts: collection definition (`defineCollection`), loader, optional schema, entries.
- Config home: content config under source.
- Spoken API cards: `getCollection`, `getEntry`.
- Collections do not auto-create routes → pair with dynamic page + often `getStaticPaths`.
- Build-time vs live: name the tradeoff; prefer build-time when content is relatively static.
- `[RECAP G]`
- `[REVIEW: R5 getStaticPaths + collections]`

### H. Closing synthesis + self-check
- One story: content validated in a collection → paths generated → HTML shell prerendered → client/server islands where needed.
- `[REVIEW: R6]` three questions + answers.
- Tease Episodes 2–5 without requiring them.
- Sign-off.

## Spoken API cards to include in SCRIPT.md

1. `Astro.props` — read inputs passed into a component  
2. `client:load` / `idle` / `visible` / `media` / `only` — when to hydrate  
3. `server:defer` — defer server HTML for an island  
4. `getStaticPaths` — declare prerendered dynamic routes  
5. `defineCollection` — register a collection with loader (+ schema)  
6. `getCollection` — fetch all (or filtered) entries  
7. `getEntry` — fetch one entry  

## Anti-patterns to avoid in the script

- No fenced code blocks meant to be read as code
- No “open your editor” scaffolding tour
- No dependence on repo projects
- No deep adapter setup or custom loader implementation
