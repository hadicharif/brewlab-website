# Running the Brew Lab website

Notes for the shop: how to run, publish and set up the site.

## Run it on your Mac

You need Node.js (https://nodejs.org). In Terminal:

```bash
cd ~/Desktop/BrewLab
npm install          # first time only
npm run dev          # opens http://localhost:5173
```

## Publish a new version

Push to the `main` branch on GitHub. Netlify builds it (`npm run build:prototype`, settings in `netlify.toml`)
and brewlablb.com updates about a minute later.

To check the build on your Mac first:

```bash
npm run build:prototype
```

## Database

The SQL files in `supabase/` were run once, in this order, in **Supabase → SQL Editor**:

1. `schema.sql` — accounts, orders, rewards
2. `feedback.sql`
3. `loyalty-card.sql`
4. `editor.sql` — owners' editor, website content, change history, menu photos
5. `social-role.sql`
6. `customers.sql` — customers list, phone numbers, WhatsApp offers opt-in

New changes go in a new SQL file that is safe to run twice. Don't edit files that were already run.

## Roles

**Owner** (everything), **Staff** (staff page), **Social media** (Promos tab only). Owners set roles in
Edit website → Staff.

## Never commit

- The Supabase **secret / service_role** key
- The Google **client secret**
- Any `.env` file

The public *publishable* key in `src/config.js` is meant to be public; the database rules protect the data.
