# Bug-fix & usability update (September 2026)

**Security**
- Next.js upgraded 15.0.3 → 15.0.8 (15.0.3 has a critical remote-code-execution vulnerability, CVE-2025-66478).
- Checkout now takes every price from the database — customers can no longer change prices in their browser.
- Every admin save/delete action now checks the admin is logged in. Set `SESSION_SECRET` in production.

**Storefront fixes**
- Wholesale "Add to Cart" buttons did nothing — they now add the 1 kg wholesale pack at the wholesale price.
- Cart: quantity +/− buttons; removing one size no longer removes every size of that product; delivery fee shown.
- Product cards add the correct size/price; product page shows limited/out-of-stock state properly.
- Checkout collects an (optional) email — before, no customer could ever leave a review because orders had no email.
- Reviews: after submitting, customers see a clear message (unverified reviews used to land on a broken page).
- Contact and Support forms now confirm "message received".
- Language switch keeps you on the same page; mistyped links (e.g. `/shop`) redirect to `/en/shop`; unknown pages show a proper 404.
- Hidden products/bundles can no longer be opened by direct link; empty SEO fields no longer blank out page titles.
- Redirects after forms/login no longer jump to the live domain when testing on localhost.

**Admin fixes & simplifications**
- Database tables are created automatically on startup (admin pages used to crash with "no such table: bundles").
- WhatsApp automation switch could never be turned ON — fixed.
- Grouped sidebar menu + a phone-friendly menu (the admin had no navigation on mobile).
- Green "saved" / red "please fix…" messages after every form.
- One clear product form (Add & Edit): sizes with their own prices, photo picker with upload + preview, SEO tucked under "Advanced".
  Web address (slug) and SKU are filled automatically.
- Uploaded photos are stored in `data/uploads` and served from `/uploads/…` (files added to `public/` after a build are not served by Next.js).
- Bundles can now be edited and deleted (with photos); categories can be deleted when empty.
- Orders: search by order #/name/phone, status filter, WhatsApp-customer button, notes; dashboard totals exclude cancelled orders.
- Manual orders: choose product size, adjust price, clear error messages.
- Inventory: stock can't go negative (processing/packaging are checked), g ↔ kg conversion on purchases, dates default to today.

---

# Aura Foods — Build Status (this session)

**Status: build-verified.** `npm run build` passes cleanly, and every route below was
smoke-tested against a running server in the build sandbox (all returned HTTP 200):
`/en`, `/ur`, `/en/shop`, `/en/product/kunri-red-chili`, `/en/about`, `/en/wholesale`,
`/en/faq`, `/en/contact`, `/en/track-order`, `/en/support`, `/en/blog`, `/en/cart`,
`/en/checkout`, `/admin/login`, `/sitemap.xml`, `/robots.txt`.

## Stack
Next.js 15 (App Router) + TypeScript + Tailwind, **SQLite via Drizzle ORM** (chosen for this
build so it runs anywhere with zero external services — swap to Postgres later by changing
`src/db/index.ts` and `src/db/schema.ts`'s dialect if you want to match the earlier
Postgres/Coolify plan). Data lives in `data/aura.db`, already seeded.

## Admin login
`/admin/login` — username `admin`, password `AuraAdmin@2026`. Change this before going live
(see `src/db/seed.ts`, or add a "change password" screen — not yet built, see Gaps below).

## What's built and working end-to-end
- **Bilingual EN/UR storefront** with proper RTL for Urdu, EN/اردو switcher, real content
  pulled from your uploaded reference site (hero copy, about/contact/FAQ text, real 8-product
  catalog with bilingual names/descriptions/ingredients/usage, real testimonials, blog post
  summaries, contact/social details).
- **Logo** placed in the header, footer, favicon, admin login screen, and printable invoice.
- **Cart → Checkout → Order** flow: client-side cart (localStorage) → `/api/checkout` creates
  a real order (unified `orders` table) → order-time stock validation blocks orders on
  products marked Out of Stock → WhatsApp confirmation is triggered automatically.
- **Admin dashboard** (`/admin`, behind login):
  - Central Sales Dashboard — totals, paid/pending, cancelled, by channel, by month.
  - Manual Order Entry across all 8 sources (Website/FB/IG/TikTok/WhatsApp/Offline/Phone/Other)
    into the same central table as website orders, with a printable invoice per order.
  - Supplier Management with live-computed purchase/paid/outstanding totals.
  - Raw Material Purchasing — logging a purchase auto-increments that material's stock.
  - Grinding/Processing — auto-computes wastage qty & %, auto-deducts raw-material stock,
    mints a batch number (`PB-XXXXXX`), auto-creates the Finished Goods batch.
  - Finished Goods / Packaging — packaging auto-deducts remaining powder and adds to the
    product's **internal** stock only.
  - Stock Traceability lookup by batch number (purchase → processing → wastage → powder →
    packaging → sold-in-orders), plus a "Stock Fulfilment" panel on each order to link line
    items to a packaging batch (this is what feeds the "sold" figures in traceability).
  - Website Stock Control is a genuinely separate admin-only control (Available / Limited /
    Out of Stock / manual display qty / hide) from Internal Inventory Stock — enforced in code:
    `setWebsiteStock()` in `src/lib/admin-actions.ts` is the *only* function allowed to write
    those columns; packaging only ever touches `internalStockQty`.
  - Reviews Moderation — pending/approve/reject/delete; only approved reviews show publicly.
  - Per-product bilingual content manager (EN/UR side by side) + SEO panel (meta title/description,
    canonical, no-index, image ALT) per product.
  - WhatsApp automation ON/OFF + template editor; payment-integration status readout.
- **SEO architecture**: sitemap.xml, robots.txt, per-language canonical/hreflang metadata,
  JSON-LD (Organization on every page, Product + AggregateRating on product pages).
- **Reviews**: public submission form on product pages, hard-gated on verified purchase
  (email → matching order → that specific product), landing as Pending in the moderation
  queue; no path to submit without a matching order. Editing after submission is not offered
  anywhere in the UI (matches "reviews are locked" requirement).

## Stubbed — clearly labelled, not hidden
- **JazzCash**: checkout accepts the selection and creates the order with `paymentStatus: pending`,
  but no live merchant integration is wired yet — the settings page shows it as "Stub — needs
  credentials." COD is fully live.
- **WhatsApp send**: `src/lib/whatsapp.ts` calls Meta's real Cloud API endpoint *if*
  `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` env vars are set; otherwise it logs the
  rendered message server-side as a stub so the confirmation workflow can be exercised without
  a live account.

## Known gaps (flagged, not oversights)
- No self-service "change admin password" screen yet — change the seeded hash directly in
  `src/db/seed.ts` / the DB for now.
- No image-upload UI in admin — product images are set in the seed data / DB directly.
- Delivery-charge logic in checkout is a simple placeholder (flat Rs. 150 under Rs. 1500,
  free above) rather than the real 3-zone city-based pricing your old site used — that data
  is documented in the project's existing-site-extracted-data notes if you want it wired in.
- Bundles, full testimonials/FAQ/blog CMS editing are not built (same scope as previously
  flagged) — current blog/FAQ/testimonials content is real copy but hardcoded, not admin-editable.
- Not deployed anywhere yet — this is a local build. To run: `npm install && npm run build &&
  npm run start`, or `npm run dev` for development. Reseed with `npm run seed` if you delete
  `data/aura.db`.
