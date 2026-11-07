# Brew Lab website — notes for Claude Code

## The owner
Hadi, co-founder of Brew Lab Coffee Beacon (Tripoli, Lebanon). Uses a Mac: give commands in Mac/Terminal terms.
Explain steps simply, one click at a time. Prices are in US dollars.

## The project
- React 19 + Vite. Source in `src/`, static files in `public/`.
- Live at https://brewlablb.com (Netlify project `brewlab-lb`). Netlify builds from GitHub on every push to main
  (settings in `netlify.toml`: `npm run build:prototype`, publish `prototype/`, Node 22).
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

## Git: every change goes to GitHub, on main
- Repository: https://github.com/hadicharif/brewlab-website (private). Hadi wants **every** change saved there.
- After each finished change (and a successful build), commit straight to the **main** branch with a short, plain
  message (e.g. "Add Spanish latte", "Fix footer on mobile") and push. No separate branches or pull requests.
- Never commit `node_modules/`, `prototype/`, `dist/`, `.env` files or any secret key (`.gitignore` covers these).
- If this folder isn't a git repository yet, connect it first: `git init -b main`,
  `git remote add origin https://github.com/hadicharif/brewlab-website.git`, `git fetch origin`,
  `git reset origin/main` (keeps the local files), then commit and push any differences.
- Tell Hadi when a change is pushed. A push to main also updates brewlablb.com about a minute later (Netlify
  builds it), so make sure the build passes before pushing.

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

## Done at launch (7 Nov 2026)
- Google sign-in published; Supabase Auth URLs set to https://brewlablb.com; all SQL files run; test data cleared.

## Open items
- Google Analytics code is in place (`src/lib/analytics.js`, events order_sent / sign_up / reward_redeemed, off on
  #staff and #editor) but off until `GA_ID` in `src/config.js` is set to Hadi's G-… ID. When it's set, add a line
  about Google Analytics to public/privacy.html (EN + AR).
- More menu photos (upload from Edit website → Menu).
- Google search details are in index.html (CafeOrCoffeeShop data, title, description) plus public/robots.txt and
  public/sitemap.xml. If the opening hours change in the editor, update `openingHoursSpecification` in index.html too.
- Ideas: daily sales summary on the staff page, monthly database backup, a short rewards-terms page.
- "Powered by Netlify" badge only goes away on a paid Netlify plan (or by moving hosting to Cloudflare Pages).
