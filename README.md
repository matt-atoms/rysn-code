# rysn-code

Custom JavaScript and CSS for the [RYSN](https://rysn.webflow.io) skincare storefront, built on Webflow + Smootify. Served via the jsDelivr CDN and loaded into Webflow Site Settings → Custom Code.

## How it's loaded

Two tags, site-wide — one for JS, one for CSS:

```html
<!-- Head code -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/matt-atoms/rysn-code@main/src/styles/main.css">

<!-- Footer code -->
<script src="https://cdn.jsdelivr.net/gh/matt-atoms/rysn-code@main/src/scripts/main.js" defer></script>
```

One `main.js` + one `main.css` for the whole site. Organize within each file using section comments as features land.

**Versioning:** pinned to `@main` during development. Before launch, pin to a semver tag (e.g. `@v1.0.0`) or a commit SHA so nothing deploys by surprise.

**Cache busting in dev:** jsDelivr caches aggressively. If a change isn't picking up, purge via:
```
https://purge.jsdelivr.net/gh/matt-atoms/rysn-code@main/<path>
```

## Structure

```
src/
├── scripts/
│   └── main.js       <- all site-wide JavaScript
├── styles/
│   └── main.css      <- all site-wide CSS
└── animations/       <- reserved for GSAP/motion code when CSS isn't enough
```

## Rules

1. **CSS-first.** Animations default to CSS transitions or `@keyframes`. GSAP only when CSS genuinely can't express the effect (scroll-linked, FLIP, physics, SVG morph).
2. **No new Webflow classes.** CSS rules target existing Relume classes or data attributes. Don't introduce new class names that would collide with Webflow's class system.
3. **Always include `prefers-reduced-motion`.** Disable non-essential motion for users who ask.
4. **Section comments.** Within each file, mark features clearly with header comments so it stays navigable as it grows.

## Conventions

- Plain ES JavaScript — no build step, no bundler.
- CSS uses existing Webflow CSS custom properties from the Relume token system (e.g. `var(--_primitives---colors--brand-beige)`).
- Keep commit messages clean — the repo is public.
