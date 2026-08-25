# Research sources — Episode 1 Foundations

Canonical documentation for the audio series. Prefer these URLs over blog posts or this repository’s Astro apps. Facts in scripts should match these pages; rewrite only for spoken clarity—do not invent APIs.

**Docs snapshot:** Locked against [docs.astro.build](https://docs.astro.build/) (current public docs as of research for this series). Astro’s Content Layer, server islands (`server:defer`), and client directives are treated as current baseline.

## Primary Episode 1 pages

| Topic | URL | Notes for script accuracy |
|-------|-----|---------------------------|
| Why Astro | https://docs.astro.build/en/concepts/why-astro/ | Content-driven; five principles: content-driven, server-first, fast by default, easy to use, developer-focused. Zero JS by default; UI-agnostic; islands; content collections. Contrasts SPA (client-heavy) with Astro’s server-first / MPA-leaning approach. |
| Islands architecture | https://docs.astro.build/en/concepts/islands/ | Client islands = interactive JS hydrated separately. Server islands = dynamic server HTML rendered separately. Selective / partial hydration. Astro components = static HTML, no client runtime. |
| Server islands guide | https://docs.astro.build/en/guides/server-islands/ | `server:defer`; needs an adapter; fallback via `slot="fallback"`; shell can stay cacheable while deferred parts fetch later. |
| Components | https://docs.astro.build/en/basics/astro-components/ | Two parts: component script (code fence `---`) and component template. Props via `Astro.props`. Slots (default, named, fallback). Script JS does not ship to the browser. |
| Template directives | https://docs.astro.build/en/reference/directives-reference/ | Client: `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`. Server: `server:defer`. Default: framework components render HTML without hydrating unless a `client:*` is set. |
| Routing | https://docs.astro.build/en/guides/routing/ | File-based routes from `src/pages/`. Dynamic `[param]` and `[...rest]`. Static mode requires `getStaticPaths()` returning `{ params }` (optional `props`). On-demand dynamic routes do not use `getStaticPaths`. Navigation with standard `<a href>`. |
| Content collections | https://docs.astro.build/en/guides/content-collections/ | Collections = related structured entries. Build-time vs live. Define in `src/content.config.ts` with `defineCollection`, loader, optional schema. Built-in loaders `glob` / `file` from `astro/loaders`. Query with `getCollection` / `getEntry` (and live variants). Collections do not auto-create routes—pair with dynamic pages. |
| On-demand rendering | https://docs.astro.build/en/guides/on-demand-rendering/ | Default: prerender at build. Adapter required for on-demand. Opt out with `export const prerender = false`, or default server with `output: 'server'` then opt in with `prerender = true`. Server islands also need an adapter. |
| Project structure | https://docs.astro.build/en/basics/project-structure/ | Roles of `src/`, `src/pages/`, `public/`, `astro.config.mjs`, `content.config.ts`. |

## Supporting pages (cite lightly in Ep1; deeper in later episodes)

| Topic | URL |
|-------|-----|
| Framework components | https://docs.astro.build/en/guides/framework-components/ |
| Endpoints | https://docs.astro.build/en/guides/endpoints/ |
| Middleware | https://docs.astro.build/en/guides/middleware/ |
| Routing reference (`getStaticPaths`, paginate) | https://docs.astro.build/en/reference/routing-reference/ |
| View transitions | https://docs.astro.build/en/guides/view-transitions/ |
| Astro home / product framing | https://astro.build/ |

## Version-sensitive notes (speak carefully)

1. **Prerender is the default** for pages and endpoints unless configured otherwise. On-demand needs an adapter.
2. **Content Layer:** collections are defined in `src/content.config.ts` with a required **loader** and optional **schema**. Prefer `getCollection` / `getEntry` language over legacy “folder equals collection with no config” mental models.
3. **Entry identity:** modern collection entries use an `id`; when teaching route generation, talk about mapping entry ids (or chosen slugs) into `params`—avoid teaching only the Astro 2 `slug`-centric story without checking current docs.
4. **Client islands** require a `client:*` directive on a UI framework component imported into an Astro file. No directive → HTML only, no hydration JS.
5. **`client:only`** skips server HTML for that component and **requires** the framework name as its value (e.g. react).
6. **Server islands** use `server:defer` on an Astro component; they need an adapter; fallback content uses the named fallback slot.
7. **Collections ≠ routes.** Content lives outside automatic page generation; you create dynamic routes that query the collection.

## Secondary commentary (optional analogies only)

Use only for metaphor inspiration; verify every factual claim against primary docs above.

- Historical “islands” coinage context appears in the official Islands page (Katie Sylor-Miller; Jason Miller / Preact write-up)—safe to mention briefly as history, not as API.

## Out of scope for Episode 1 (do not deep-dive)

- Full adapter configuration matrices
- Authoring custom loaders from scratch
- Actions, sessions, view transitions internals
- Hosting-specific caching headers beyond the server-island *idea*
- Line-by-line project scaffolding walkthroughs
