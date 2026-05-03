# Xylos AI Smoke Test

Run this checklist after database migrations, billing env updates, or deploys. Use production at `https://xyloss.tech` unless you are testing a local branch.

## Public Pages

- Home page loads without console errors.
- Pricing shows Free, Plus at NGN 3,000/month, Pro at NGN 5,000/month, and School onboarding.
- Pricing Plus button opens Paystack initialization for `plan=plus`.
- Pricing Pro button opens Paystack initialization for `plan=pro`.
- School signup link opens the school onboarding flow.

## Student Auth And Chat

- New student can sign up and lands in onboarding.
- Student onboarding creates a profile and redirects to chat.
- Free student can send a chat message.
- Free student sees daily usage in Settings as `messages_today / 20`.
- Free student sees Pro tools locked in the empty chat state.
- Plus student sees unlimited messages in Settings and no daily meter.
- Pro student can use Study Plan and Exam Drill suggestions from chat.

## School Flow

- School admin signup uses `/api/auth/setup-org`, not browser-side organization inserts.
- School admin lands on the school dashboard after onboarding.
- Dashboard loads organization stats, student list, activity, and invite code.
- Invite code can be copied from Settings.
- Student can join with a valid invite code.
- School admin Settings shows school billing status.
- School admin can start Paystack school billing from Settings.
- School admin can open Paystack subscription management from Settings after first successful billing.
- School admin can request cancellation from Settings.

## Billing And Webhooks

- Paystack initialize rejects unknown plans.
- Plus checkout verifies against `PAYSTACK_PLUS_PLAN_CODE`.
- Pro checkout verifies against `PAYSTACK_PRO_PLAN_CODE`.
- School checkout verifies against `PAYSTACK_SCHOOL_PLAN_CODE`.
- Webhook rejects invalid signatures.
- Webhook rejects mismatched or unverified transactions.
- Successful webhook activates the user profile plan.
- Successful school webhook also activates the organization plan.
- Successful checkout stores Paystack subscription management tokens in `billing_subscriptions`.
- Manage membership redirects to Paystack's hosted management link.
- Cancel membership disables the Paystack subscription and marks the profile billing status as canceled.
- Activation and cancellation emails are sent without blocking webhook success.

## Email

- Authenticated user can trigger the welcome email endpoint.
- Unauthenticated welcome email request returns `401`.
- Invalid email or missing user email is rejected.

## Regression Checks

Run:

```sh
npm run check
npm run build
npm run test:e2e
```

Then verify the deployed app:

- No server errors in Vercel logs during signup, chat, billing initialize, or webhook handling.
- Supabase `profiles`, `organizations`, `conversations`, and `messages` rows are created with the expected owner IDs.
- A user cannot load or append to another user's conversation by changing the conversation ID.
