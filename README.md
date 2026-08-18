# PennyWise AI

Text a Telegram bot or send it a payment screenshot, and it shows up — categorized —
on a clean web dashboard. No manual entry.

**Stack:** Vite + React 18 + Tailwind (frontend) · Netlify Functions (backend) ·
Supabase Postgres + Auth + Storage + Realtime (data) · Telegram Bot API (input) ·
Google Gemini Flash (OCR + parsing + categorization).

---

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of `supabase/migration.sql` → **Run**.
   This creates `profiles`, `transactions`, `subscriptions`, enables Row Level
   Security on all three, adds the auto-profile-creation trigger, turns on
   Realtime for `transactions`, and creates a private `receipts` storage bucket.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose this to the browser)

## 2. Telegram bot setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot` → follow the prompts.
2. Copy the token BotFather gives you → `TELEGRAM_BOT_TOKEN`.
3. Note the bot's `@username` → `VITE_TELEGRAM_BOT_USERNAME` (used to build the QR deep link).

## 3. Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) → create an API key.
2. Copy it → `GEMINI_API_KEY`. The webhook uses `gemini-2.0-flash` for both image OCR and text parsing.

## 4. Local development

```bash
npm install
cp .env.example .env      # fill in the values from steps 1–3
npm run dev                # frontend on http://localhost:5173
```

The Netlify Function itself needs the Netlify CLI to run locally (it reads the
non-VITE_ env vars from `.env` too):

```bash
npm install -g netlify-cli
netlify dev                # serves both the frontend and /netlify/functions/*
```

## 5. Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
   Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
3. **Site settings → Environment variables** → add all six variables from
   `.env.example` (both the `VITE_*` ones and the backend-only ones).
4. Deploy. Note your site URL, e.g. `https://pennywise-ai.netlify.app`.

## 6. Register the Telegram webhook

Point Telegram at your deployed function (replace both placeholders):

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<your-site>.netlify.app/.netlify/functions/telegram-webhook"
```

A `{"ok":true,"result":true}` response confirms it's live. Verify anytime with:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

## 7. Link your account

1. Sign up on the deployed site.
2. Click **Sync Telegram** in the navbar → copy the `/link <user_id>` command
   (or scan the QR code, which opens the bot directly).
3. Send it to your bot in Telegram. You'll get a confirmation, and the dashboard
   badge switches to "Telegram synced."
4. Send a payment screenshot, or type something like `Spent 450 on Zomato via UPI`.
   It appears on the dashboard within a second or two via Supabase Realtime.

---

## Routing

- `/` — public landing page (marketing copy, "how it works," pricing).
- `/login` — sign in / sign up.
- `/app` — the dashboard (redirects to `/login` if not signed in).

## Selling this as a product

The landing page and `profiles.plan` column (`free` / `pro` / `business`) give
you the shape of a subscription business, but **no payment provider is wired
up yet** — right now `plan` just sits at `'free'` for everyone and nothing
enforces the limits shown on the pricing cards. To actually charge people
you'd add:

1. A payments provider (Stripe is the standard fit) with three price IDs
   matching the three plans in `src/lib/pricing.ts`.
2. A Netlify Function webhook that listens for `checkout.session.completed`
   and updates `profiles.plan` accordingly.
3. Plan checks in the dashboard/webhook (e.g. block new transactions past
   50/month on the Free plan) — currently every signed-up user has unlimited
   access regardless of plan.

## How categorization works

Every screenshot or text message goes through Gemini Flash with a fixed JSON
schema (`amount`, `category`, `payment_mode`, `description`, `type`), and
`category` is constrained to the same nine values used everywhere else in the
app — `Food & Dining`, `Groceries`, `Bills & Utilities`, `Travel`, `Shopping`,
`Entertainment`, `Investments`, `Health`, `Other` — so a `₹120` Zomato order
lands in *Food & Dining* and a Big Bazaar receipt lands in *Groceries*
automatically, with the same colors and icons across the donut chart, ledger,
and charts. If you ask a question instead ("What did I spend on food this
month?"), the webhook fetches your recent transactions and has Gemini answer
conversationally using only that data.

## Project structure

```
pennywise-ai/
├── netlify/functions/telegram-webhook.ts   # bot logic + OCR + NL parsing
├── supabase/migration.sql                  # schema, RLS, triggers, storage
├── src/
│   ├── lib/
│   │   ├── supabaseClient.ts               # browser Supabase client + types
│   │   ├── AuthContext.tsx                 # session/profile state
│   │   └── categories.ts                   # category → color/icon source of truth
│   ├── components/                         # Navbar, charts, ledger, cards
│   ├── pages/                              # Login, Dashboard
│   └── App.tsx
├── .env.example
└── netlify.toml
```
