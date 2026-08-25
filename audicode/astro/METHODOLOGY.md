# Audio-first methodology

Rules for writing and recording Astro teaching scripts so they work without looking at a screen.

## Core constraints

- Understanding must not depend on code or text on screen.
- Teach purpose and use cases first, then go deep concept by concept.
- Explain how things work and how to use them—do not read code line by line.
- Recap high-level ideas at the end of each major section.
- Revisit deeper details later with spaced repetition.
- If an API must be named, break it into jobs and algorithms, not syntax tours.

## Teaching ladder (every topic)

1. **Why it exists** — the problem or job
2. **Mental model** — analogy and what lives where
3. **Moving parts** — named pieces and how they relate
4. **How you use it** — decision rules and typical workflow
5. **Common mistakes** — what people confuse
6. **Checkpoint recap** — high-level only (`[RECAP]`)

## Code narration rules

When you must mention code or APIs:

- Name the **library or function** and its **job** in one sentence.
- Describe **local logic as an algorithm** (“for each post, build a route object…”).
- Prefer **one idea per sentence**; then pause; then the next function.
- Never say “next line,” “look at this,” “as you can see,” or “on the screen.”
- Use a **Spoken API card** pattern:
  - Name (spoken once clearly)
  - Purpose
  - What you give it / what you get back (plain language)
  - One realistic usage scenario

Symbols: spell them once (“client colon load”), then use a spoken nickname (“the client-load directive”).

Paths: prefer roles (“the pages folder under source”) over dumping paths. If a path is essential, say it slowly once and immediately say what that folder *does*.

## Audio-native devices

- **Spatial metaphors** — sea of HTML; client islands; server islands
- **Timeline stories** — build time → request time → browser hydrate
- **Contrast pairs** — SPA vs MPA; prerender vs on-demand; client island vs server island
- **Spoken decision trees** — “If you need clicks and browser state, use a client directive. If you only need personalized HTML, use server-defer.”

## Section endcaps and spaced repetition

### Recaps (`[RECAP]`)

At the end of each major section: about 60–90 seconds. Purpose of the section plus three to five sentences restating the model. No new facts.

### Reviews (`[REVIEW: topic]`)

After new material that *depends* on earlier material, insert 20–40 seconds that re-asks or re-applies a prior detail in a new scenario.

Pattern: **introduce → use lightly → recap → later re-test with a new scenario.**

Tag every review beat in the script so recording and editing stay intentional.

Minimum for a foundations episode: **six** spaced review beats plus a final interleaved self-check.

## Spoken formatting

- Target about **130–150 words per minute**.
- Mark `[PAUSE]` at mental-model shifts.
- Signpost: “Part two of three…”, “Before we go deeper…”, “Hold that idea—we’ll use it in routing.”
- Cold open with a problem story, then a short syllabus map.
- End with a **listener self-check**: three spoken questions, then answers.

## What video may show (optional)

Visuals are optional and must not be required. Prefer architecture diagrams over code panes. If code appears on screen, narration still explains concepts as if the screen is blank.

## Companion notes

A cheatsheet with names and doc links is fine for *after* listening. The audio must not require it.

## Blind-listen quality bar

Before calling a script done:

1. Read it aloud once. Flag any moment that requires “seeing” something → rewrite.
2. Every major section has a `[RECAP]`.
3. Spaced `[REVIEW]` beats reuse earlier details in new contexts.
4. Code appears only as spoken API cards or algorithm narration.
5. Facts match [research/sources.md](./research/sources.md); invent nothing.
