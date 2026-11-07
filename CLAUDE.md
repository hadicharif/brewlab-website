# Brew Lab website — notes for Claude Code

## The owner
Hadi, co-founder of Brew Lab Coffee Beacon (Tripoli, Lebanon). Uses a Mac: give commands in Mac/Terminal terms.
Explain steps simply, one click at a time. Prices are in US dollars.

## The project
- React 19 + Vite. Source in `src/`, static files in `public/`.
- Live at https://brewlablb.com (Netlify project `brewlab-lb`, deployed by dragging the `prototype/` folder).
- `npm run dev` → http://localhost:5173. `npm run build:prototype` → single-file site in `prototype/` (copies `public/`).
- Bilingual English/Arabic (RTL). All visible text lives in `src/i18n.jsx` (`UI`, `NAMES`, `WORDS`) or the
  component's own `T`/`L` table. Every new string needs both languages.

## Data
- Supabase project `jsdosihotoohepgpeier`. Only the publishable key is in `src/config.js`.
  **Never** add the service_role/secret key or the Google client secret anywhere in the code.
- All writes go through SECURITY DEFINER functions that check `is_staff()` / `is_owner()` / `is_social()`; tables use RLS.
- Schema changes: write a new `supabase/<name>.sql` file (safe to run twice: `if not exists`, `create or replace`)
  and tell Hadi to run it in Supabase → SQL Editor. Don't edit old SQL files that were already run.
- Menu, prices and promos start from `src/data/*.js`; owners' changes are stored in `site_content` and laid on top by
  `src/data/content.js` (`applyContent`). Keep both working: the site must run with an empty `site_content`.

## Key files
- `src/data/menu.js` (menu, prices), `src/data/drinkLab.js` (Build a drink, add-on prices), `src/data/promos.js`
- `src/RewardsContext.jsx` (sign-in, profile, points), `src/ContentContext.jsx` (editor content)
- `src/components/StaffPage.jsx` (`#staff`), `src/components/EditorPage.jsx` + `src/components/editor/*` (`#editor`)
- `src/lib/phone.js` (phone numbers saved as digits with country code, e.g. 96170552950)

## Design
Sage green, peach and charcoal brand colours (CSS variables in `src/styles.css`). Mobile first. Keep the existing look;
check both English and Arabic, phone and desktop, after changes.

## Before saying something is done
Run `npm run build:prototype` and make sure it builds without errors.

## What's been built so far (handed over from the Claude chat)
- Menu + Build a drink + WhatsApp ordering; sticky category filter with "All"; Spanish lattes; Nestle (free) and
  Spanish flavours; add-ons priced (flavour/shot/cream/decaf $1, almond/oat $1.50, skimmed/lactose-free free);
  extra shots and flavours can be added more than once (− / + counters).
- Rewards: Google + email-link sign-in, "Keep me signed in", QR loyalty card, points only added when staff confirm an
  order or scan a card in store, rewards codes, birthday drink. Phone number required for every member
  (older members get a "One more thing" pop-up), optional WhatsApp-offers opt-in.
- Staff page (`#staff`): orders, card scanner, reward codes, rewards history, feedback.
- Owners' editor (`#editor`): Menu (prices, photos to Supabase Storage `menu-photos`, sold out, hide, add items),
  Add-ons, Shop (hours, Closed today, WhatsApp, Instagram), Promos, Rewards, Customers (list, copy numbers, CSV),
  Staff (roles), History. Social media role sees Promos only.
- Footer: WhatsApp, Instagram (@brewlab.lb), feedback link. Privacy page mentions phone numbers and the offers opt-in.

## Open items
- Google sign-in is still in "Testing" mode in Google Cloud: publish it (Branding: home page https://brewlablb.com,
  privacy https://brewlablb.com/privacy.html, authorized domain brewlablb.com) so anyone can use Google sign-in.
- Supabase Auth → URL Configuration should have Site URL https://brewlablb.com and redirect https://brewlablb.com/**
  (keep http://localhost:5173/** for testing).
- Google Analytics not installed yet: Hadi will send a Measurement ID (G-…); add it, track order sent / sign-up /
  reward used, and mention it in privacy.html.
- "Powered by Netlify" badge only goes away on a paid Netlify plan (or by moving hosting to Cloudflare Pages).
- Idea: connect Netlify to the GitHub repo so pushes deploy automatically.
