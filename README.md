# Blues Apparel 23 — Premium E-Commerce Demo

A complete, mobile-first demonstration online store and admin dashboard for **Blues Apparel 23**,
prepared by **Rajsu Technologies**. It shows how Instagram / WhatsApp selling can become an
organised e-commerce business. **All products, prices, stock, orders, customers and payments are
demonstration data. Nothing is a real transaction.**

Stack: React 18 · TypeScript · Vite · Tailwind CSS · React Router · Lucide · Framer Motion · Recharts · localStorage.
No backend, paid API or payment credentials are needed.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

Requires Node 18+.

## The 10-step owner demo

1. Browse the homepage, categories, `/shop` and `/collections`.
2. Open a product (`/product/satin-slip-midi-dress`).
3. Pick a colour and size, use Quick View, size guide, zoom, or **Ask on WhatsApp** (pre-fills product, size, colour).
4. **Add to Bag** (or **Buy Now**). Try coupon `DEMO10` or `WELCOME200` (min. ₹1,999) in the bag.
5. Complete the 3-step simulated checkout (UPI / Card / Net Banking; COD is disabled until the business confirms it).
6. See the order confirmation with a generated demo order ID.
7. Open **/admin** (link in the header of the admin area, or type the URL).
8. In **Admin → Orders** the new order is at the top; stock was deducted automatically (**Inventory**).
9. Open it, press **Advance to…** or choose a status; add a tracking number; generate a sample invoice.
10. Go to **/track-order** (or Account → My Orders) and watch the status change.

Tip: *Account → Use demo account* logs in as a sample customer who already has orders at various stages.
*Admin → Website → Demo data → Reset* restores everything.

## What is where

```
src/
  data/seed.ts          Brand facts, 30 demo products, categories, collections, looks, policies, FAQ, seeded orders
  types.ts              Domain types
  store/                localStorage-backed stores (db = shop data, shop = cart/wishlist/user) + UI/toast state
  services/index.ts     Service layer: catalog, cart, coupons, auth, orders, admin, enquiries, newsletter
  services/endpoints.ts Planned REST contract for the Spring Boot backend
  components/           ui/, layout/ (header, footer, mobile nav), shop/ (cards, quick view, gallery), art/ (placeholder artwork)
  pages/                Customer pages; pages/admin/ for the dashboard
```

All routes from the brief exist: `/`, `/shop`, `/new-arrivals`, `/collections`, `/collections/:category`,
`/product/:slug`, `/wishlist`, `/cart`, `/checkout`, `/order-confirmation`, `/track-order`, `/account`, `/about`,
`/contact`, `/faq`, `/shipping-policy`, `/return-policy`, `/cancellation-policy`, `/privacy-policy`, `/terms`,
`/payment-policy`, and `/admin`, `/admin/products|orders|inventory|customers|reports|settings`.
`/collections/:category` accepts a category id (e.g. `dresses`) or a themed collection id (e.g. `weekend-edit`).

## Content rules followed

* Verified facts only: name, 2023, hours 9 AM–8 PM, call +91 9862227298, WhatsApp +91 8794546813 (`https://wa.me/918794546813`),
  Instagram profile, ITI Veng, Mualpui Road near Ion Digital.
* Everything else (products, prices, stock, fabrics, size charts, coupons, order data) is clearly sample data.
* Return/refund/cancellation pages state the Instagram-bio position (no refund, exchange or cancellation) **subject to owner confirmation**.
  Delivery times and charges are **not invented**; the delivery charge is a ₹0 placeholder editable in Admin → Website.
* **Get Directions** stays disabled until the exact map link is verified: Admin → Website → Store info → tick
  “Map location verified” and paste the link.
* Instagram gallery is a local demo gallery (no fake live integration) linking to the real profile.
* Customer services (WhatsApp help, availability, styling, store visit, delivery, order support) can be switched on/off in Admin → Website.
* No real card data is ever collected. Demo login never stores or checks passwords.

## Replacing the placeholder imagery

No licensed photography was available, so the demo uses generated placeholder artwork (SVG garments in the brand palette)
so that no image can ever be broken. To use real photos:

* In **Admin → Products → Edit → Images**, upload product photos (resized and kept in the browser for the demo), or
* Set `images` on products in `src/data/seed.ts` to image URLs (e.g. `/images/dress-1.jpg` in `public/`). Components fall back to the artwork if an image fails.
* For hero / about / store / Instagram images, replace the `<Scene name="…" />` components in `src/pages/Home.tsx`,
  `src/pages/Static.tsx` and `src/components/shop/Blocks.tsx` with `<img>` tags.

## Moving to production (Spring Boot + PostgreSQL)

`src/services/index.ts` is the only layer that touches data. Replace its functions with `fetch` calls to the endpoints sketched in
`src/services/endpoints.ts`, and keep components unchanged. Suggested production pieces: Spring Security (JWT/session) for customer and
admin auth, REST APIs, a certified payment gateway with webhook confirmation, cloud image storage (S3/Cloudinary), PostgreSQL for
products/inventory/orders/customers, server-side stock deduction in a transaction, and a real admin login (the demo admin is open).

## Deploying

**Netlify** — drag the `dist/` folder into Netlify, or connect the repo. `netlify.toml` already sets
build command `npm run build`, publish `dist`, and the single-page-app redirect.

**Vercel** — import the repo; framework preset *Vite*; `vercel.json` adds the SPA rewrite.

Because data lives in each visitor's browser, every visitor sees a fresh copy of the demo data and their own changes only.

## Quality notes

Semantic landmarks, skip link, keyboard-accessible controls with visible focus, ARIA on dialogs / radio groups / toggles, reduced-motion support,
form validation with inline errors, lazy-loaded admin and chart code, code-split vendor bundles, SEO titles/descriptions per page.
