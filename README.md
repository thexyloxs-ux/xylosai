# Xylos AI

Xylos AI is a SvelteKit study assistant for students and schools. It combines Supabase auth/data, Groq chat completions, Paystack billing, Resend email, and a school admin dashboard.

## Stack

- SvelteKit 2 and Svelte 5
- Supabase Postgres, Auth, RLS, and SQL migrations
- Groq API for chat generation
- Paystack subscriptions for Plus, Pro, and School billing
- Resend for transactional email
- Vercel adapter for production deployment

## Local Setup

Install dependencies:

```sh
npm install
```

Create `.env` from `.env.example` and fill in real values:

```sh
cp .env.example .env
```

Required environment variables:

- `GROQ_API_KEY`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PLUS_PLAN_CODE`
- `PAYSTACK_PRO_PLAN_CODE`
- `PAYSTACK_SCHOOL_PLAN_CODE`
- `RESEND_API_KEY`
- `PUBLIC_APP_URL`

For local development, use:

```sh
npm run dev
```

For production, `PUBLIC_APP_URL` should be `https://xyloss.tech`.

## Database

Migrations live in `supabase/migrations`. Apply them with the Supabase CLI after linking the project:

```sh
npx supabase link --project-ref jttvcfyyrlnjjvrxiith
npx supabase db push
```

Important backend assumptions:

- User-owned data is protected by Supabase RLS.
- Server-only writes that need service-role access must validate ownership first.
- Free quota increments are handled atomically in the database.
- Sensitive RPCs are restricted to `service_role`.

## Billing

Individual billing uses two Paystack plans:

- Plus: NGN 3,000/month
- Pro: NGN 5,000/month

School admins register through school onboarding, then activate school billing from Settings when ready. Paystack webhooks must point at:

```txt
https://xyloss.tech/api/paystack/webhook
```

The app verifies webhook signatures, verifies transactions with Paystack, normalizes allowed plan types, and rejects mismatched plan codes.

## Deployment

The Vercel project is linked locally through `.vercel/project.json`, which is ignored by Git. Production environment variables must match `.env.example` and use:

```txt
PUBLIC_APP_URL=https://xyloss.tech
```

After changing environment variables, redeploy the project so server routes pick up the new values.

## Verification

Run static checks and a production build before pushing:

```sh
npm run check
npm run build
```

For live release checks, use [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md).

## Security Notes

Never commit `.env`, service-role keys, Paystack secret keys, or Vercel auth files. If a live secret is pasted into chat or shared outside the dashboard, rotate it before relying on it in production.
