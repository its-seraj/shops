# Wholesale India

Mobile-first multi-category shopping site for lead capture. The first catalog is wholesale spices, with the data model ready for future categories such as gadgets.

## What Is Included

- Next.js App Router storefront with category browsing, product cards, product detail pages, cart drawer, quantity updates, and full-address enquiry checkout.
- Supabase-ready database schema for categories, products, pack-size variants, lead orders, and lead order item snapshots.
- Admin login, dashboard, catalog forms, order lead list, status updates, and WhatsApp-ready follow-up links.
- SQL seed data for Supabase; runtime catalog data is loaded from Supabase, not hardcoded.
- Meta Pixel hooks for `PageView`, `AddToCart`, and `Lead`; they safely no-op when no pixel ID is configured.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill the values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
```

If Supabase values are empty, the public storefront shows setup notices instead of products. Real catalog data, admin writes, and saved leads require Supabase.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Run `supabase/seed.sql` to add the first spice category, products, and pack sizes.
4. Create an admin user in Supabase Auth using email/password.
5. Add the project URL, anon key, and service role key to `.env.local`.

Product images can use public image URLs or public Supabase Storage URLs from the `product-images` bucket.

## Verification

```bash
npm test
npm run typecheck
npm run build
```
