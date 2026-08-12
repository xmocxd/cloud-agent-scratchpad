# Astro Wiki

Prototype Astro site that turns markdown chapters into a browsable HTML wiki.

## Features

- **Chaptered markdown** in `src/content/chapters/` (ordered via front matter)
- **Sidebar navigation** plus previous/next chapter links
- **Client-side search** across titles, descriptions, and body text
- **Quick links** on the home page for chapters with `starred: true`
- **Auto wiki links** — the first plain-text mention of another chapter’s title becomes a link

## Front matter

```md
---
title: Constellations
description: Patterns humans drew between stars.
order: 2
starred: true
---
```

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
