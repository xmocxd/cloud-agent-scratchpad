# Episode 1 — Cheatsheet (optional, post-listen)

Use this **after** listening. The audio script does not require it.

Official docs hub: https://docs.astro.build/

## Core ideas

| Idea | One-line meaning |
|------|------------------|
| Content-driven | Optimized for blogs, docs, marketing, storefronts—sites that showcase content |
| Server-first | Prefer HTML from build/server over a full client-rendered app by default |
| Zero JS by default | Astro components render to HTML; no Astro client runtime shipped by default |
| Client island | Interactive UI hydrated in the browser (needs `client:*`) |
| Server island | Deferred personalized/dynamic **server HTML** (`server:defer`; needs adapter) |
| File-based routing | Files under `src/pages/` map to URLs |
| Content collection | Related structured entries + loader + optional schema; query via content APIs |

## Spoken names → APIs

| You heard | API / directive | Docs |
|-----------|-----------------|------|
| Astro props | `Astro.props` | [Components](https://docs.astro.build/en/basics/astro-components/) |
| Client-load | `client:load` | [Directives](https://docs.astro.build/en/reference/directives-reference/#clientload) |
| Client-idle | `client:idle` | [Directives](https://docs.astro.build/en/reference/directives-reference/#clientidle) |
| Client-visible | `client:visible` | [Directives](https://docs.astro.build/en/reference/directives-reference/#clientvisible) |
| Client-media | `client:media` | [Directives](https://docs.astro.build/en/reference/directives-reference/#clientmedia) |
| Client-only | `client:only="framework"` | [Directives](https://docs.astro.build/en/reference/directives-reference/#clientonly) |
| Server-defer | `server:defer` | [Server islands](https://docs.astro.build/en/guides/server-islands/) |
| Get static paths | `getStaticPaths()` | [Routing](https://docs.astro.build/en/guides/routing/) |
| Define collection | `defineCollection()` | [Content collections](https://docs.astro.build/en/guides/content-collections/) |
| Get collection | `getCollection()` | [Content collections](https://docs.astro.build/en/guides/content-collections/) |
| Get entry | `getEntry()` | [Content collections](https://docs.astro.build/en/guides/content-collections/) |
| Glob / file loaders | `glob`, `file` from `astro/loaders` | [Content collections](https://docs.astro.build/en/guides/content-collections/) |
| Prerender false | `export const prerender = false` | [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) |

## Decision tree (pocket version)

1. Can the HTML be known at build time? → Prefer prerender.
2. Need per-visit personalized **HTML** without browser interactivity? → Server island (`server:defer`).
3. Need clicks / client state / browser APIs? → Client island (`client:*` matching urgency).
4. Many similarly shaped documents? → Content collection + schema + loader.
5. Need a URL per entry? → Dynamic page + (static mode) `getStaticPaths` mapping entries → params.

## Episode 1 doc anchors

- [Why Astro?](https://docs.astro.build/en/concepts/why-astro/)
- [Islands architecture](https://docs.astro.build/en/concepts/islands/)
- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Directives reference](https://docs.astro.build/en/reference/directives-reference/)
- [Routing](https://docs.astro.build/en/guides/routing/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Project structure](https://docs.astro.build/en/basics/project-structure/)
- [Server islands](https://docs.astro.build/en/guides/server-islands/)
