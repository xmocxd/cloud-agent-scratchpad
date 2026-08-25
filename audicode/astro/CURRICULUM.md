# Curriculum map

Series learning path for audio-first Astro teaching. All episode content is grounded in [docs.astro.build](https://docs.astro.build/). See [research/sources.md](./research/sources.md) for canonical URLs.

## Episode 1 — Foundations (script complete)

**Folder:** [`ep01-foundations/`](./ep01-foundations/)  
**Target runtime:** ~45–75 minutes spoken  
**Outcomes:** The listener can explain what Astro is for, why zero-JS-by-default matters, how `.astro` components work, islands vs static HTML, file-based routing basics, and the idea of content collections—without writing code from memory.

| Section | Docs anchors | Teaching focus |
|---------|--------------|----------------|
| A. Why Astro exists | [Why Astro?](https://docs.astro.build/en/concepts/why-astro/) | Content-driven sites; five design principles; SPA vs server-first MPA |
| B. Mental model of a page | [Islands](https://docs.astro.build/en/concepts/islands/), [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) | Build-time HTML vs request-time HTML vs browser JS |
| C. Astro components | [Components](https://docs.astro.build/en/basics/astro-components/) | Fence (script) vs template; props; slots; no client runtime by default |
| D. Islands architecture | [Islands](https://docs.astro.build/en/concepts/islands/), [Server islands](https://docs.astro.build/en/guides/server-islands/) | Client islands vs server islands; selective hydration |
| E. Client directives | [Directives reference](https://docs.astro.build/en/reference/directives-reference/) | `client:load` / `idle` / `visible` / `media` / `only` as *when* JS loads |
| F. Routing basics | [Routing](https://docs.astro.build/en/guides/routing/) | Pages folder → URLs; static vs dynamic params; role of `getStaticPaths` |
| G. Content collections intro | [Content collections](https://docs.astro.build/en/guides/content-collections/) | Why collections; schema/validation; `getCollection` / `getEntry` jobs |
| H. Closing synthesis | — | Full-system story: content → routes → static shell → islands |

**Spaced-repetition schedule (Ep1):**

- After C: review server-first / zero JS default
- After D: review component fence vs template
- After E: review client vs server island decision rule
- After F: review islands on a mostly-static page
- After G: review `getStaticPaths` when generating post pages from collections
- Final: interleaved quiz-style recap of all major concepts

---

## Episode 2 — Building pages & styling (outline only)

**Outcomes:** Describe layouts, styling approaches, assets, and Markdown/MDX pages as mental models.

**Topics:**

- Project structure roles (`src`, `pages`, `components`, `layouts`, `public`) — [Project structure](https://docs.astro.build/en/basics/project-structure/)
- Layout components and slots as page chrome
- Styling: scoped styles by default, global opt-in
- Images and static assets (conceptual)
- Markdown and MDX as content/pages

**Defer deep:** advanced CSS tooling, every image optimization option.

---

## Episode 3 — Content system in depth (outline only)

**Outcomes:** Explain Content Layer loaders, schemas, querying, and build-time vs live collections.

**Topics:**

- `defineCollection`, loaders (`glob`, `file`, custom), schemas
- Query APIs: `getCollection`, `getEntry`, related helpers
- Generating routes from collection entries
- Build-time vs live collections and when each fits
- Rendering entry content conceptually

**Defer deep:** authoring a full custom loader from scratch line-by-line.

---

## Episode 4 — On-demand rendering & adapters (outline only)

**Outcomes:** Explain prerender defaults, adapters, hybrid sites, endpoints, and middleware at a conceptual level.

**Topics:**

- Default prerender; `prerender = false`; `output: 'server'`
- Adapters as runtime bridges (Netlify, Vercel, Cloudflare, Node)
- Server endpoints (API routes) as exported handlers
- Middleware as request wrapping (auth, logging, headers)
- Cookies, request, response globals in on-demand pages

**Defer deep:** host-specific adapter config matrices.

---

## Episode 5 — Interactivity & polish (outline only)

**Outcomes:** Place framework components, view transitions, and integrations in the Astro mental model.

**Topics:**

- UI framework components as client islands — [Framework components](https://docs.astro.build/en/guides/framework-components/)
- View transitions as progressive navigation enhancement
- Actions / sessions at high level (what problem they solve)
- Integrations as extension points
- When Astro is *not* the best fit (heavy client apps)

**Defer deep:** full SPA-in-Astro patterns, every integration catalog entry.
