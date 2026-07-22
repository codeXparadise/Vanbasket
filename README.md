# VAN Honey Storefront

Next.js storefront for VAN raw honey with Supabase-backed authentication, profiles, addresses, catalog variants, and order creation.

## Requirements

- Node.js 20+
- Supabase project with the migrations in `supabase/migrations` applied

## Environment

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it to client components or public build artifacts.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

The production build may show a Supabase Edge Runtime warning from the session middleware. The build should still complete successfully.

## Database

Apply migrations in order:

1. `20260621122000_init_ecommerce.sql`
2. `20260622120000_seed_van_honey_catalog.sql`

The seed migration creates the product and variant IDs used by the storefront cart.

## Production Notes

- Online payment is not integrated yet. Checkout creates a pending order without collecting card details.
- Order stock deduction is guarded against negative inventory, but a database transaction or RPC should be added before high-volume launch to make order creation and inventory updates fully atomic.
- Add webhook handling and payment status updates when Stripe or Razorpay is selected.
- Add end-to-end tests for signup/login, profile completion, address management, checkout, and order history.
