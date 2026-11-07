# Brew Lab Coffee Beacon — website

The website for Brew Lab Coffee Beacon in Tripoli, Lebanon: **https://brewlablb.com**

Customers browse the menu (English and Arabic), build a drink, and send their order on WhatsApp.
Members get a QR loyalty card, earn points, and swap them for rewards. Staff confirm orders and scan cards;
owners change the website from a built-in editor, with no code.

## What's inside

| Part | What it does |
|---|---|
| Menu, Build a drink, Cart | Order on WhatsApp, with prices, add-ons, sold-out items and opening hours |
| Rewards | Sign in with Google or an email link, QR card, points, rewards, birthday drink |
| `#staff` | Staff page: confirm orders, scan cards and add in-store points, check reward codes, read feedback |
| `#editor` | Owners' editor: menu, prices, photos, add-ons, shop hours, Closed today, promos, rewards, customers, team, history |
| `#feedback` | Feedback page |
| `privacy.html` | Privacy policy |

Roles: **Owner** (everything), **Staff** (staff page), **Social media** (Promos tab only).

## Tech

- React + Vite (`src/`)
- Supabase for accounts and data (`supabase/*.sql`); the site uses only the public *publishable* key in `src/config.js`
- Hosted on Netlify at brewlablb.com

## Run it on your Mac

You need Node.js (https://nodejs.org). In Terminal:

```bash
cd ~/Desktop/BrewLab
npm install          # first time only
npm run dev          # opens http://localhost:5173
```

## Publish a new version

```bash
npm run build:prototype
```

Then drag the `prototype` folder onto **Netlify → brewlab-lb → Deploys**.

## Database

The SQL files in `supabase/` were run once, in this order, in **Supabase → SQL Editor**:

1. `schema.sql` — accounts, orders, rewards
2. `feedback.sql`
3. `loyalty-card.sql`
4. `editor.sql` — owners' editor, website content, change history, menu photos
5. `social-role.sql`
6. `customers.sql` — customers list, phone numbers, WhatsApp offers opt-in

## Never commit

- The Supabase **secret / service_role** key
- The Google **client secret**
- Any `.env` file
