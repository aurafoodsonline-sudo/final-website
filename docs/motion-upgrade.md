# Motion upgrade — Lenis + GSAP + React Bits (September 2026)

Build verified with `npm run build`. Tested in Chromium: English and Urdu, desktop and phone,
reduced-motion mode, JavaScript switched off, client-side navigation, shop filters, add to cart.
The admin panel is untouched.

## New libraries
| Package | Version | Used for |
| --- | --- | --- |
| `lenis` | 1.3.26 | Smooth scrolling |
| `gsap` + `@gsap/react` | 3.15.0 / 2.1.2 | Scroll-triggered reveals, hero parallax, header, SplitText headlines |
| `motion` | 13.4.4 | Required by several React Bits components |

## What changed on the site
- **Everywhere:** Lenis smooth scrolling (synced to GSAP), a chili→turmeric scroll-progress bar,
  a header that tucks away while scrolling down and returns on scroll up, animated underline on
  menu links, a "pop" on the cart badge when something is added, and a spinning logo on hover.
- **Home:** hero headline animates letter by letter (Urdu: word by word), shimmering badge
  (ShinyText), blur-in subtitle (BlurText), magnetic buttons (Magnet), and the banner zooms and drifts
  as you scroll. A new ribbon of spice names follows the hero and speeds up with scrolling
  (ScrollVelocity), and it fills itself from the product list. Product grids are now centred
  when a section has fewer than 4 items. Cards rise in one by one, and "Why Aura" cards have a
  cursor spotlight (SpotlightCard). The WhatsApp button has an animated star border (StarBorder).
- **Product cards (everywhere):** spotlight glow, lift and image zoom on hover.
- **About:** the stats count up (CountUp), the carousel reveals with a wipe, and the value cards
  have the spotlight effect.
- **Shop / Product / Wholesale / Blog / FAQ / Contact:** scroll reveals, and the image on the
  product page reveals with a wipe. FAQ items get a +/× icon, and blog and wholesale cards zoom
  on hover.

## New content animates automatically
You don't need to do anything. Everything added inside a page's `<main>` gets the effects by itself:
a new page, section, heading, paragraph, image, form, FAQ item or card grid. It also covers every
product, bundle or category added from the admin panel, because their cards and grids are
already animated.

| What you add | Effect it gets |
| --- | --- |
| Big headings (`h1`, `h2`) | Wipe up into view |
| Grids of cards (`grid` or `flex-wrap`) | Cards appear one after another |
| Images | Gentle zoom-in |
| Smaller headings, paragraphs, lists, forms, tables, quotes, FAQ items | Fade + rise |

**Optional controls:**
- To give something a different effect, add an attribute (it overrides the automatic one):
  `data-reveal="up" | "fade" | "zoom" | "clip" | "stagger" | "heading"`, plus `data-reveal-delay="0.2"`
  if needed. `data-speed="0.3"` adds parallax drift.
- To keep something still, add `data-no-reveal` (it covers everything inside it too).
- For the letter-by-letter headline effect, use `<AnimatedTitle text=… lang=… />`.
- Add `data-lenis-prevent` to any box that must keep native scrolling, such as a scrollable popup.

The automatic list is defined in two places that must stay in sync: `AUTO` in
`src/components/motion/RevealManager.tsx` and the "Automatic mode" rule in `src/app/globals.css`.

## Update — spice ribbon font and home-page bundles
- The scrolling spice ribbon now uses a handwritten script font (Dancing Script, bold). Urdu keeps
  Nastaliq, because the script font has no Urdu letters. The font ships with the site through
  the `@fontsource/dancing-script` package (OFL licence), so it doesn't depend on Google Fonts.
- A **Special Bundles** section now sits on the home page right after Best Sellers. It shows every
  bundle that isn't hidden, animates like the product grids, and updates automatically when you
  add, edit or delete bundles in Admin → Bundles. If there are no bundles, the section is hidden.

## Safety nets
- Visitors whose phone or computer asks for **reduced motion** get the site with no animation
  and normal scrolling.
- Content never stays hidden: if the animation code hasn't started within 4 seconds, or
  JavaScript is off, everything shows normally.
- Urdu headings animate by word, so the Nastaliq letters stay joined.

## Files
- `src/components/motion/*`: SmoothScroll, ScrollProgress, RevealManager, AnimatedTitle,
  HeroMotion, SpiceMarquee, MotionProviders
- `src/components/reactbits/*`: React Bits components (MIT + Commons Clause, licence included).
  Local tweaks are marked `AURA:`.
- `src/lib/gsap.ts`: registers the GSAP plugins in one place
