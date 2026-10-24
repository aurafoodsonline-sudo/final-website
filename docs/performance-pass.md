# Performance pass — lighter site, same features

Nothing was removed. Every page, product, bundle, animation and admin screen works as before.

## What changed
- **Images re-encoded** (`public/images/*`): 9.3 MB → 3.8 MB. Same filenames, so every reference,
  database row and Next.js image URL keeps working. Photos are capped at 1000 px (logo and favicon
  at 512 px). The two worst files were 2.3 MB and 2.2 MB (`category_6.jpg`, `category_3.jpg`) and
  are now about 200 KB each. Smaller originals also mean less work for the server's image optimizer.
- **Google Fonts no longer block the first paint.** The stylesheet loads after paint, with a
  `<noscript>` fallback, so the same four font families still load.
- **ScrollVelocity (spice ribbon) fix:** its inner component was defined inside the render function,
  so React rebuilt the marquee rows on every render. It now lives at module scope.
- **New 3D scroll depth** (GSAP ScrollTrigger, scrubbed to scroll position, transforms only):
  - Product and bundle cards tip toward the viewer as they scroll in (`data-depth="card"`).
  - Every `main > section` folds in from its top edge on wide screens (`data-depth="fold"`).
    Add `data-no-depth` to any section that should not do this.
  - The home-page hero banner tilts back into depth on wide screens as you scroll away from it.
  - All of it is off when the visitor asks for reduced motion.

## Recommended next steps (not done here)
1. **Install `sharp` for production image optimization.** Without it, Next.js falls back to a much
   slower WebAssembly encoder. Run `npm install sharp` locally and commit the updated
   `package-lock.json`, so Coolify's `npm ci` still matches.
2. **Cache the storefront's database reads.** Every page sets `dynamic = "force-dynamic"`, so each
   visit runs several database queries (settings, text, products, bundles, content). Caching these
   with `unstable_cache` plus `revalidateTag` from the admin actions would cut server load a lot. It
   changes when admin edits appear on the site, so it is worth doing as a deliberate change.
3. **Compress uploads.** Admin product and bundle photos (up to 5 MB) are served as uploaded
   (`unoptimized`). Resizing them to about 1000 px on upload would keep new photos light too.
