# Episode 1 — Astro Foundations (Audio Script)

**Target runtime:** ~60 minutes  
**Sources:** docs.astro.build (see `../research/sources.md`)  
**Recording notes:** Honor `[PAUSE]`, `[RECAP]`, and `[REVIEW: …]`. Do not skip retention beats. Never point at the screen. Pace: about one hundred thirty to one hundred fifty words per minute.

---

## Cold open

This episode teaches the foundations of Astro, a JavaScript web framework. It is designed to be understood by listening only. You will not need to see code. When I name a function, I will state its job. When I describe usage, I will describe decisions and step-by-step logic, not syntax.

Here is the problem Astro addresses. Many websites exist mainly to deliver content: blogs, documentation, marketing pages, online stores. When these are built with frameworks designed for interactive applications, the browser has to download and run a large amount of JavaScript before the page becomes useful. That slows down first paint, drains batteries on phones, and can hurt search indexing when content arrives late. For a page whose main job is showing text and images, most of that JavaScript is overhead.

Astro's approach: render pages to plain HTML on the server or at build time, ship little or no JavaScript by default, and let you add JavaScript only to the specific components that need it.

[PAUSE]

Here is the plan for this episode, in order:

One — why Astro exists and what kinds of sites it fits.  
Two — a mental model of when a page gets rendered: build time, request time, and browser time.  
Three — Astro components, the basic building block.  
Four — islands architecture: client islands and server islands.  
Five — client directives, which control when interactive JavaScript loads.  
Six — file-based routing.  
Seven — content collections, an introduction.  
Eight — a final synthesis and self-check.

Each section ends with a short recap. Throughout the episode there are review beats that re-ask earlier material. When you hear a review question, try to answer it before I do. That retrieval effort is what makes the material stick.

If you already know React or another UI framework, note that Astro's defaults differ deliberately; your existing knowledge applies inside islands, which we will define. If you are newer to web development, knowing HTML and the concept of a URL is enough background for this episode.

[PAUSE]

---

## Section A — Why Astro exists

### Teaching beat

Astro is a framework for content-driven websites: blogs, marketing pages, documentation, portfolios, publishing sites, community sites, and e-commerce storefronts. The common trait: the visitor's goal is to reach content, and the site succeeds when that content arrives quickly.

Most modern JavaScript frameworks were designed for applications: dashboards, inboxes, social feeds, design tools. In those products, the browser maintains a lot of interactive state, and shipping a client-side application runtime is justified. Content sites usually do not need that runtime for most of the page. A documentation page is mostly text and navigation. A blog post is mostly text. Astro renders these to HTML ahead of time and ships JavaScript only where you explicitly ask for it.

### Concept breakdown — five design principles

Astro's documentation lists five design principles. These are worth memorizing because they predict how the framework behaves.

First: **content-driven**. The framework is optimized for showing content, not for simulating a desktop application in the browser.

Second: **server-first**. HTML is rendered on the server or at build time whenever possible, rather than being constructed in the browser by client-side JavaScript. This is the same basic approach as traditional server frameworks like PHP or Rails, but the languages stay HTML, CSS, and JavaScript or TypeScript. You do not need a second server-side language.

Third: **fast by default**. The stated goal is that it should be hard to build a slow site by accident. The main mechanism is shipping less JavaScript, because JavaScript is the most expensive kind of asset per byte: it must be downloaded, parsed, and executed.

Fourth: **easy to use**. The Astro component language is a superset of HTML: any valid HTML is a valid Astro component. Features from other component systems, such as expressions in markup and scoped styles, are added on top. Complexity is opt-in.

Fifth: **developer-focused**. Official tooling, editor support, and documentation are part of the framework's scope.

[PAUSE]

### Contrast: single-page applications versus Astro's model

A useful contrast to name precisely. A single-page application, or SPA, loads one JavaScript application that renders and re-renders the page in the browser, and handles navigation client-side. This gives smooth in-app transitions and rich state handling, at the cost of a larger initial JavaScript payload and slower time-to-interactive.

Astro follows a multi-page model: each URL is a separate HTML document, rendered ahead of time or on the server, and navigation uses ordinary links. Interactive regions are added per-component. The important difference is the default: Astro starts from zero client JavaScript and you add it where needed; a SPA starts from a full client runtime and you optimize it down.

### Feature names to hold for later

Four terms will come up repeatedly. I will only define them fully in later sections; for now, register the names:

- **Islands** — interactive or personalized components inside an otherwise static page.
- **UI-agnostic** — you can write island components in React, Vue, Svelte, Solid, Preact, and others, even mixed on one page.
- **Zero JavaScript by default** — components render to HTML; client JavaScript is only added when requested.
- **Content collections** — a system for organizing, validating, and querying structured content such as Markdown files.

### How you use this idea

When deciding whether Astro fits a project, ask: if this site shipped as well-structured HTML and CSS with a small number of interactive widgets, would users get what they came for? If yes, Astro's defaults match the problem. If the product is itself a complex interactive application—a collaborative editor, a dense dashboard—a client-centric framework may be the better primary tool, though Astro can still host application-like regions as islands.

### Common mistakes

Mistake one: choosing Astro for a heavily interactive application just because it benchmarks fast on content pages. Match the tool to the dominant workload.

Mistake two: assuming server-first means no interactivity. Interactivity is available; it is opt-in per component.

Mistake three: assuming static HTML means stale content. Sites are rebuilt when content changes, and Astro also supports request-time rendering for pages that genuinely need it.

### [RECAP — high level]

Astro targets content-driven sites. It renders HTML on the server or at build time, ships zero client JavaScript by default, keeps authoring close to HTML, and lets you add interactive components from any major UI framework where needed. The key vocabulary so far: islands, UI-agnostic, zero JavaScript by default, and content collections.

[PAUSE]

---

## Section B — Mental model of a page

### Teaching beat

Before any specific feature, fix a timeline in your head. A page can be rendered at up to three different times: **build time**, **request time**, and **browser time**. Most confusion in Astro comes from mixing these up—expecting build-time code to know the current user, or expecting browser code to have server secrets.

### Concept breakdown

**Build time** is when you run the production build, once, before deployment. By default, Astro prerenders every page, route, and endpoint into static HTML at build time. The rendering work happens once; the output is files that can be served from any static host or CDN.

**Request time** is when a visitor requests a URL and a server runs code for that specific visit. Astro supports this through **on-demand rendering**, also called server-side rendering or SSR. It requires an **adapter**: an integration that packages Astro's server code for a specific runtime, such as Node, Netlify, Vercel, or Cloudflare. Request-time rendering is for pages that cannot be known ahead of time: personalized pages, pages showing frequently changing data.

**Browser time** is everything after the HTML arrives: parsing, painting, and running any JavaScript that makes components interactive.

The defaults matter. Astro prerenders everything unless you opt out. To render one route on demand, you add an adapter and set the exported constant `prerender` to false in that route's file. For a mostly-dynamic app, you can instead set the build output option to server, which makes on-demand the default, and then set `prerender` to true on the few static pages. For this episode you only need to know the dial exists and which way it points by default.

[PAUSE]

### The default sequence

1. You write pages and components.
2. The build renders them to HTML and assets.
3. A visitor receives HTML and CSS from static hosting or a CDN.
4. JavaScript loads only for components you explicitly marked as interactive—possibly none.
5. If you used on-demand routes or server islands, those specific pieces are rendered at request time; the rest of the site is unaffected.

### A classification procedure

When designing any feature, ask these four questions in order:

Can this HTML be fully determined at build time? If yes, prerender it.

Does it vary per user or per request? If yes, it needs request-time rendering, which means an adapter.

Does it need clicks, input handling, local state, or browser APIs? If yes, it needs client-side JavaScript—a client island.

Does it need per-request HTML but no browser interactivity? Then it is a candidate for a server island, defined in section D.

### Common mistakes

Mistake: thinking a static site involves no server. A server still serves the files; the difference is whether your application code runs per request.

Mistake: making an entire page request-time rendered because one small region is personalized. Islands exist so the static shell can stay prerendered and cached while one region renders per request.

Mistake: fetching user-specific data at build time. Build time runs once, before any user exists in the picture; there is no current user at build time.

### [RECAP — high level]

Three rendering times: build, request, browser. The default is build-time prerendering to static HTML. Request-time rendering is opt-in and requires an adapter. Browser JavaScript is reserved for components that need interactivity. Classify every feature by which time it belongs to.

[PAUSE]

---

## Section C — Astro components

### Teaching beat

Astro components use the `.astro` file extension and are the basic building block of an Astro project. The single most important fact about them: they have no client-side runtime. They render to HTML at build time or at request time, and the JavaScript you write inside them runs during that render, on the server side. None of it is sent to the browser.

When you need client interactivity, you do not add it by changing the Astro component's mode. You either use plain HTML and standard script tags, or you embed a UI framework component as a client island, or you defer a region's server rendering as a server island. The Astro component itself stays a server-rendered template.

### Concept breakdown — two parts

An Astro component has two parts: the **component script** and the **component template**.

**The component script.** It sits at the top of the file inside a code fence: a line of three dashes, the script, then another line of three dashes—the same convention as Markdown frontmatter. In the script you can import other components, import data files, fetch from APIs or databases, and compute variables for the template. This code runs only during rendering. Because it never reaches the browser, it can safely use secrets: private API keys, direct database access.

The script can read the component's inputs through a global called **Astro.props**.

Spoken API card — **Astro.props**:  
Purpose: read the values passed into the component by whoever used it.  
You give: attributes on the component when you use it, the same syntax as HTML attributes.  
You get: an object with those values, usually destructured into named variables in the script. Defaults can be supplied for missing props.  
Scenario: a heading component receives a title prop; the script reads it from Astro.props; the template prints it inside a heading tag.

**The component template.** Everything below the fence. It is HTML, plus three additions: curly-brace expressions that interpolate values computed in the script, imported components used as tags, and Astro's template directives. If the template maps an array into elements, describe it as logic: for each item in the list, output one list-item element containing the item's name.

[PAUSE]

### Composition: props and slots

**Props** pass data from a parent component into a child, downward, at render time.

**Slots** pass markup from a parent into a placeholder inside a child. A slot element in the child's template marks where the parent's children will be inserted. There are three variants to know:

- The **default slot** receives all children that are not otherwise labeled.
- **Named slots** receive only children labeled with a matching slot name. A child template can define several named slots—for example one after the header and one after the footer—and the parent labels each piece of content for its target slot.
- **Fallback content**: a slot can contain default markup that renders only when the parent passed nothing for it.

**Layouts** are an application of slots, not a separate system. A layout is an Astro component containing the shared page structure—the HTML document shell, header, footer—with a slot where each page's content is inserted. A page imports the layout, wraps its content in the layout's tag, and the content lands in the slot.

### How you use this idea

Write shared UI as Astro components whenever it does not need client-side interactivity. Put data loading and computation in the script; put markup in the template. Pass data down with props. Use slots when the child owns the wrapper and the parent owns the inner content. TypeScript users can declare a Props interface in the script for editor checking, but the model works the same without it.

### Common mistakes

Mistake: treating the component script as browser JavaScript. It runs at render time on the server side; browser features like the window object are not available there.

Mistake: expecting React-style hooks or reactive state inside an Astro component. There is no client runtime, so there is no client state. Interactivity comes from islands or plain script tags.

Mistake: duplicating headers and footers across pages instead of writing a layout with a slot.

### [RECAP — high level]

An Astro component is a server-rendered template in two parts: a script fence for imports, data fetching, and props; and a template for HTML output. Props pass data down; slots pass markup in; layouts are components with slots. No component JavaScript is sent to the browser.

[PAUSE]

### [REVIEW: server-first / zero JS]

From section A: Astro is server-first with zero JavaScript by default. Apply it: if a page is built entirely from Astro components and plain HTML, what JavaScript does the visitor download for those components?  
[PAUSE]  
None. The components rendered to HTML during the build; only the HTML and CSS ship. Client JavaScript enters only when you add islands, which is the next section.

---

## Section D — Islands architecture

### Teaching beat

Islands architecture is a rendering pattern: deliver the majority of the page as static HTML, and embed a small number of independent, self-contained interactive or dynamic regions—the islands. Astro's documentation describes it as interactive widgets in a sea of static, server-rendered HTML. The pattern was named by frontend architect Katie Sylor-Miller and elaborated by Jason Miller of Preact; Astro was the first mainstream framework with this selective approach built in.

The performance logic: instead of one JavaScript bundle that hydrates the entire page, each island loads and initializes independently, and non-island regions load no component JavaScript at all.

### Concept breakdown — two kinds of islands

Astro has two island types, and the distinction is central.

**Client island.** An interactive UI framework component—React, Svelte, Vue, and so on—that is **hydrated** in the browser. Hydration means: the component's HTML was already rendered on the server and is present in the page; the browser then downloads the component's JavaScript and attaches it to that existing HTML to make it interactive. You create a client island by adding a client directive to the component; without a directive, the component renders to static HTML only. Client islands are for interactivity: input, clicks, state.

**Server island.** An Astro component whose server rendering is **deferred**: the page ships without it, showing fallback content in its place, and the island's HTML is fetched and inserted after the page loads. You create one with the **server:defer** directive—after this first mention, I will call it server-defer. Server islands are for per-request HTML without interactivity: a logged-in user's avatar, a cart count, personalized recommendations. The main page can remain prerendered and cached, because the personalized part is fetched separately.

Server islands require an adapter, because rendering the deferred HTML is server work at request time.

Mechanically, at build time Astro replaces a server-deferred component with its fallback content plus a small script; at load time that script fetches the island's rendered HTML from a dedicated endpoint and swaps it in. You do not need to memorize the mechanism; remember the effect: static shell first, deferred HTML after, each island independent.

[PAUSE]

### Properties worth remembering

- Islands are isolated. Each one loads without waiting for the others. A slow island does not block a fast one.
- Isolation is why Astro supports multiple UI frameworks on one page: each island is its own component tree.
- Client islands can still communicate with each other in the browser—through events or shared stores—but they do not share one framework runtime tree.
- Fallback content for a server island is provided through a slot named fallback, and it should approximate the final size of the island to avoid layout shift when the real content arrives.

Spoken API card — **server:defer**:  
Purpose: convert an Astro component into a server island whose rendering is deferred out of the main page render.  
You give: the directive on the component, and optionally fallback children assigned to the fallback slot.  
You get: a page that renders immediately with the fallback, then replaces it with the island's server-rendered HTML.  
Scenario: an e-commerce page prerenders the product content; the cart button, which depends on the visitor's session, is server-deferred with a generic button as fallback.

### How you use this idea

Design pages by classification. Go region by region and ask: does this region need browser interactivity? If yes, it is a client island candidate. Does it need per-request HTML but no interactivity? Server island candidate. Neither? It stays static HTML. On a typical content page, most regions fall into the last category.

### Common mistakes

Mistake: hydrating everything. Marking every component as a client island reproduces the single-page-application cost that the architecture is designed to avoid.

Mistake: using a client island where a server island suffices. If the region only needs personalized HTML—no clicks, no state—a server island delivers it without shipping any framework JavaScript.

Mistake: forgetting that server islands need an adapter installed.

Mistake: omitting fallback content, causing visible layout shift when the deferred HTML arrives.

### [RECAP — high level]

Islands are independent dynamic regions in a static HTML page. Client islands are framework components hydrated in the browser, for interactivity. Server islands are components whose server rendering is deferred, for per-request HTML. Each island loads independently, and everything outside the islands ships no component JavaScript.

[PAUSE]

### [REVIEW: fence vs template]

From section C: an Astro component has a script fence and a template. Apply it: a server island needs to call a private API with a secret key to render a user's avatar. Where does that call go—in the component's script fence, or in JavaScript running in the browser?  
[PAUSE]  
In the script fence. The fence runs during server rendering and never reaches the browser, so the secret stays on the server. Browser JavaScript—client island code—must never contain secrets, because everything sent to the browser is readable by the user.

---

## Section E — Client directives

### Teaching beat

By default, when you place a UI framework component in an Astro template, Astro renders it to HTML and strips its JavaScript. The component appears on the page but is not interactive. To hydrate it, you add a **client directive**: an attribute on the component, written as the word client, a colon, and a strategy name. The directive does two things: it marks the component for hydration, and it specifies **when** the JavaScript should load.

That timing control is the point. Not all interactive components are equally urgent, and the directives let you match loading cost to actual need.

### Spoken API cards — the five directives

**client:load** — hereafter client-load. Highest priority. Loads and hydrates the component's JavaScript immediately when the page loads. Use it for interactive elements that are visible immediately and must respond right away—a buy button, a critical form.

**client:idle** — client-idle. Medium priority. Hydrates once the browser finishes its initial work and reports idle, using the request-idle-callback mechanism where available. Use it for components that should become interactive soon but should not compete with the page's initial rendering. It optionally accepts a timeout in milliseconds—a maximum wait before hydration proceeds regardless.

**client:visible** — client-visible. Low priority. Hydrates only when the component scrolls into the viewport, implemented with an intersection observer. Use it for anything below the fold, especially heavy components. If the user never scrolls there, the JavaScript never loads. It optionally accepts a root-margin value, which starts hydration when the component is within a given distance of the viewport, so it is ready by the time the user reaches it.

**client:media** — client-media. Takes a CSS media query string and hydrates only when the query matches. Use it for components that only function at certain screen sizes—for example, a sidebar toggle that exists only in the mobile layout.

**client:only** — client-only. Skips server rendering entirely: no HTML is produced at build or request time, and the component renders in the browser from scratch, loading immediately. It **requires** the framework name as its value—for example client-only equals react—because Astro never renders the component itself and cannot detect the framework. You can supply fallback content through the fallback slot to fill the space while it loads. Use client-only when the component cannot render on the server at all—for example, it depends on browser-only APIs at render time.

[PAUSE]

### How you use this idea — a decision procedure

Given a framework component on a page, decide as follows.

Does it need interactivity? No: use no directive. It becomes static HTML.

Interactive and immediately visible and urgent: client-load.

Interactive but can wait for the browser to settle: client-idle.

Below the fold or expensive: client-visible.

Only relevant at certain screen widths: client-media with the query.

Cannot render on the server: client-only, with the framework name, ideally with fallback content.

One more rule: prefer several small islands with appropriate priorities over one large island with client-load. Smaller islands mean less JavaScript per boundary and finer control over loading.

### Common mistakes

Mistake: applying client-load to everything. This loads all component JavaScript up front and forfeits the architecture's main benefit.

Mistake: using client-only out of convenience. It removes the server-rendered HTML, so the content is invisible until JavaScript runs—worse for first paint and for anything that reads the initial HTML.

Mistake: omitting the framework name on client-only. It is required, not optional.

Mistake: confusing visibility with importance. An important above-the-fold control gets client-load; an unimportant decorative widget below the fold gets client-visible or nothing.

### [RECAP — high level]

A framework component without a directive renders to static HTML. Client directives opt it into hydration and set the timing: load means immediately, idle means when the browser settles, visible means when scrolled into view, media means when a media query matches, and only means skip server rendering and render purely in the browser, with the framework named explicitly.

[PAUSE]

### [REVIEW: client vs server island decision]

From section D. A product page: the title and description are identical for every visitor; the header shows the current shopper's avatar; a reviews carousel supports swiping. Classify all three.  
[PAUSE]  
Title and description: static HTML, no island. Avatar: personalized HTML without interactivity, so a server island with server-defer. Carousel: interactive, so a client island—and since carousels usually sit lower on the page, client-visible is the typical directive.

---

## Section F — Routing basics

### Teaching beat

Astro uses **file-based routing**: the files inside the pages directory, under source, define the site's URLs. There is no separate route configuration file for ordinary pages. Navigation between pages uses standard HTML anchor tags; Astro does not require a framework-specific link component.

### Concept breakdown

**Static routes.** A page file's path and name map directly to a URL. A file named about, in pages, serves the URL slash about. A file named index serves its folder's root URL. Folders nest URL segments: a file at pages, folder about, file me, serves slash about slash me. Astro components, Markdown, and MDX files in pages all become pages.

**Dynamic routes.** A filename can contain a parameter in square brackets. A file in pages, folder authors, named bracket author bracket, matches URLs of the form slash authors slash some-name, and the matched value is available in the page as a parameter. The page reads it from **Astro.params**—an object whose keys are the bracket names from the file path.

A filename can contain several parameters, and a **rest parameter**—three dots before the name, inside brackets—matches any number of path segments, for arbitrarily deep paths.

Now the part that ties into the rendering timeline from section B. In the default static output, every page is built ahead of time, so Astro must know the complete list of URLs a dynamic route will produce. You provide that list by exporting a function named **getStaticPaths** from the dynamic route file.

Spoken API card — **getStaticPaths**:  
Purpose: enumerate the concrete URLs a dynamic route should prerender.  
You give: a function returning an array of objects. Each object has a params property whose keys match the bracket names in the filename. Each object may also carry a props property with data for that page, so the page does not have to refetch what you already loaded while listing the paths.  
You get: one prerendered HTML page per array item.  
The logic in words: collect the identities you want pages for; for each identity, produce an object with params, and optionally props; return the array; the build produces one page per entry.  
Scenario: a dynamic route for dog profiles returns three params objects with the dog names clifford, rover, and spot; the build produces three pages, and each page reads its dog name from Astro.params.

**On-demand dynamic routes** work differently. With an adapter and prerendering disabled for the route, the same bracket-filename patterns are matched at request time, for any value. There is no enumeration step and getStaticPaths is not used. The page reads Astro.params per request and decides what to render—including returning a redirect or a not-found response when the value is invalid. For this episode, keep the contrast: static dynamic routes are enumerated at build; on-demand dynamic routes are matched at request.

[PAUSE]

### How you use this idea

One file per fixed page. For a family of similar pages—posts, products, author profiles—one dynamic route file. In static mode, implement getStaticPaths to enumerate the family; read the parameter with Astro.params; pass per-page data through props when you already have it. Link between pages with plain anchor tags. Astro also supports configured redirects and rewrites for URL changes, but the core model is files map to URLs.

### Common mistakes

Mistake: creating a dynamic route in static mode without getStaticPaths. The build cannot know which URLs to produce; the enumeration is required.

Mistake: using getStaticPaths on an on-demand route. It belongs to build-time enumeration only.

Mistake: expecting files outside pages to become URLs. Only the pages directory defines routes; content elsewhere needs a route to publish it—which is exactly the relationship covered next, in content collections.

### [RECAP — high level]

Files in pages map to URLs. Bracketed filenames declare parameters, read via Astro.params. In static output, getStaticPaths enumerates every URL a dynamic route produces, optionally passing props. In on-demand output, routes match at request time without enumeration. Navigation is plain links.

[PAUSE]

### [REVIEW: islands on a mostly-static page]

From sections D and E. A blog post is prerendered to HTML. You want an interactive quiz widget in the middle of the article, built with a UI framework. Does the article become a client-rendered application, or is there a narrower change?  
[PAUSE]  
Narrower. The article stays prerendered static HTML. Only the quiz component gets a client directive, making it a client island—client-visible is a reasonable choice, since it hydrates only when the reader scrolls to it.

---

## Section G — Content collections intro

### Teaching beat

**Content collections** are Astro's system for managing sets of structurally similar content: blog posts, product entries, author profiles, documentation pages. A collection gives you three things over loose files: organization with a defined shape, validation of every entry against a schema at build time, and typed query functions instead of manual file imports.

The design is loader-based. A **loader** is the part that retrieves entries—from a folder of Markdown files, from a single JSON file, or from a remote source like a CMS through a custom or community loader. Whatever the source, pages query the collection through the same API. This loader-based design is called the Content Layer.

### Concept breakdown — moving parts

Vocabulary first: a **collection** is the set; an **entry** is one member of it.

There are two timing variants, matching the timeline from section B. **Build-time collections** are loaded during the build and stored; this is the default recommendation and fits content that changes at content-editing pace—posts, docs, product copy. **Live collections** fetch at request time, for data that must be current at the moment of the request—inventory levels, draft previews. Live collections have costs: fetching happens per request, and some build-time features like MDX rendering and image optimization are unavailable at runtime. Both variants can coexist in one project. The guidance from the docs: use build-time collections whenever possible.

Build-time collections are defined in one configuration file at the source root, named content dot config. For each collection you call **defineCollection**, providing:

- a **loader**, required — the built-in glob loader reads a folder of files matching a pattern; the built-in file loader reads entries out of a single data file;
- a **schema**, optional but strongly recommended — a declaration of the fields every entry must have, used for validation and for generated TypeScript types.

The file then exports a collections object registering each collection by name.

Spoken API card — **defineCollection**:  
Purpose: declare one collection: where its entries come from and what shape they must have.  
You give: a loader configuration and, ideally, a schema listing fields—for example title as a string, description as a string, publish date as a date.  
You get: a collection definition, registered under a name in the exported collections object.  
Scenario: a blog collection whose loader globs Markdown files from a content folder, with a schema requiring title, description, and publish date. An author forgetting a title breaks the build with a clear error, instead of shipping a broken page.

Spoken API card — **getCollection**:  
Purpose: query a collection's entries.  
You give: the collection name, and optionally a filter function.  
You get: an array of entries. Each entry carries an id and a data object holding the schema fields.  
Scenario: a blog index page calls getCollection with the name blog, sorts the entries by publish date, and renders a list of links.

Spoken API card — **getEntry**:  
Purpose: fetch a single entry.  
You give: the collection name and the entry's id.  
You get: that one entry.  
Scenario: a post page reads an id from its URL parameter and calls getEntry to load exactly that post.

[PAUSE]

### The critical relationship: collections do not create routes

Collection entries do not automatically become pages. Collection content lives outside the pages directory, so file-based routing does not see it. To publish entries as pages, you combine the two systems from this episode:

Create a dynamic route in pages. In static mode, inside its getStaticPaths, call getCollection to load the entries. Map each entry to an object whose params contain the entry's id, and pass the entry itself as props. The build then produces one page per entry, and each page renders its entry's content.

State that pipeline once more as plain steps: define the collection with a loader and schema; load entries with getCollection; convert entries to params inside getStaticPaths; the build prerenders one page per entry.

Also worth knowing when a collection is the wrong tool: a single standalone page should just be a page file; static assets like PDFs belong in the public directory; and if a data source's own client library serves you better than a loader, using it directly is fine—you simply give up the collection API's validation and typing.

### How you use this idea

Whenever you have multiple documents sharing a structure, define a collection. Make the schema strict enough to catch authoring mistakes: required titles, dates coerced into date objects, optional fields marked optional. Query with getCollection for lists and getEntry for single entries. Wire entries to URLs explicitly through a dynamic route. Default to build-time collections; use live collections only when request-time freshness is a requirement.

### Common mistakes

Mistake: putting Markdown files in a folder and calling getCollection without defining the collection in the content config. The definition—loader and registration—is required.

Mistake: expecting entries to appear as pages automatically. Routing is a separate, explicit step.

Mistake: importing content files ad hoc across the project when a collection would centralize the shape and validation.

Mistake: choosing live collections for content that changes rarely, paying a per-request cost for freshness nobody needs.

### [RECAP — high level]

A collection is a named set of same-shaped entries, defined once with a required loader and a recommended schema, and queried with getCollection and getEntry. Build-time collections are the default; live collections trade performance for request-time freshness. Collections do not create URLs—you connect them to a dynamic route yourself.

[PAUSE]

### [REVIEW: getStaticPaths + collections]

From section F. Fifty posts in a build-time collection, one dynamic route file for posts. Describe what getStaticPaths returns and where getCollection fits.  
[PAUSE]  
Inside getStaticPaths, getCollection loads the fifty entries. The function maps each entry to an object: params containing the entry's id, and props carrying the entry. It returns that array of fifty objects, and the build prerenders fifty pages. At render, each page takes the entry from props—or fetches it with getEntry—and renders it.

---

## Section H — Closing synthesis

### One walkthrough, start to finish

Follow one documentation article from authoring to the visitor, using every concept from this episode.

Authors write Markdown files sharing the same frontmatter fields: title, description, publish date. You define a build-time collection: a glob loader pointing at the content folder, and a schema requiring those three fields. A missing title now fails the build instead of shipping. That is content collections.

A dynamic route file in pages handles article URLs. Its getStaticPaths calls getCollection, maps each entry to params and props, and returns the list. At build time, Astro prerenders one HTML page per article. That is routing plus collections, at build time.

Each page renders inside a layout: an Astro component with the document shell and a slot for the article body. The layout and the article template are Astro components—script fence for data, template for HTML—so none of them ship JavaScript. That is components.

Two regions on the page are exceptions. A feedback widget near the end of the article is interactive, so it is a client island; it uses client-visible, and its JavaScript loads only if the reader scrolls that far. A signed-in badge in the header depends on the visitor's session, so it is a server island: server-defer, with a generic placeholder as fallback, filled in by request-time rendering while the rest of the page stays prerendered and cacheable. That is islands and directives, spanning request time and browser time.

The visitor gets prerendered HTML immediately. JavaScript loads for at most one widget. The personalized badge arrives separately without blocking anything. Every rendering decision maps to one of the three times: build, request, or browser.

[PAUSE]

### A drill to run without code

Pick a site you use regularly. Mentally divide one of its pages into regions. Name which regions could be static HTML, which would need a client island, and which would need a server island. Many pages need zero islands; finding none is a valid answer. The skill this builds is the classification itself.

### [REVIEW: final self-check]

Three questions. Pause and answer each before I do. If you miss one, replay that section later.

**Question one.** What does zero JavaScript by default mean for an Astro component, and what kind of site is Astro optimized for?  
[PAUSE]  
Astro components render to HTML at build or request time; their script runs during rendering and is never sent to the browser. Astro is optimized for content-driven sites, where delivering HTML quickly matters more than maintaining a client application runtime.

**Question two.** Client island versus server island—define both and give the selection rule.  
[PAUSE]  
A client island is a UI framework component hydrated in the browser via a client directive; choose it when the region needs interactivity: input, clicks, state. A server island is a component whose server rendering is deferred via server-defer; choose it when the region needs per-request HTML but no interactivity. Regions needing neither stay static HTML.

**Question three.** Why does getCollection get called inside getStaticPaths?  
[PAUSE]  
Because collections do not create routes. In static output, a dynamic route must enumerate its URLs at build time through getStaticPaths. getCollection supplies the entries, and the function maps each one to a params object—usually the entry id—so the build produces one page per entry.

### Looking ahead

Later episodes cover pages and styling in depth, the full content layer including live collections, on-demand rendering with adapters, endpoints, and middleware, and interactivity patterns including view transitions. None of them are prerequisites for using what you learned here. You can already classify any feature into build time, request time, or browser time, and into static HTML, client island, or server island—and those two classifications drive most Astro design decisions.

End of Episode 1.
