# How the Brew Lab website works

A walkthrough of the architecture and the decisions behind it, and what I'd change.

## 1. The big picture

The site is a **single-page React app** that talks to **Supabase** (hosted PostgreSQL + Auth + Storage).
There is no custom server: the browser calls Supabase directly with a public key, and **the database itself
decides what each person may read or change**.

```
React app (Netlify)
  ├─ reads   → tables protected by Row Level Security (RLS)
  ├─ writes  → Postgres functions only (place_order, confirm_order, redeem_reward, owner_save, …)
  ├─ sign-in → Supabase Auth (Google, email magic link)
  └─ order   → saved in the database, then opened as a pre-filled WhatsApp message (wa.me link)
```

Code map:

| Area | Files |
|---|---|
| Menu data and prices | `src/data/menu.js`, `src/data/drinkLab.js`, `src/data/promos.js` |
| Owners' edits laid on top of the code's menu | `src/data/content.js` (`applyContent`), `src/ContentContext.jsx` |
| Cart and checkout | `src/CartContext.jsx`, `src/components/CartDrawer.jsx` |
| Sign-in, profile, points | `src/RewardsContext.jsx`, `src/lib/supabase.js` |
| Build your drink + animated cup | `src/components/DrinkLab.jsx`, `src/components/LabCup.jsx` |
| Staff page / owners' editor | `src/components/StaffPage.jsx`, `src/components/EditorPage.jsx`, `src/components/editor/*` |
| English / Arabic | `src/i18n.jsx` |
| Database | `supabase/*.sql` |

## 2. Main flows

### Placing an order
1. The customer fills the cart. Prices come from the menu data plus the owners' edits.
2. Checkout calls `place_order(...)`. The function checks there's a name and at least one item, saves the order
   with the signed-in user's id (or none for guests), and returns an **order number**.
3. The site builds a formatted message (items, sizes, add-ons, total, pickup/delivery, order number) and opens
   `https://wa.me/<shop number>?text=...`. The shop already works on WhatsApp, so I didn't make staff learn a new inbox.
4. The order waits as `pending` until staff confirm it.

### Earning points
- Points are **never** added at checkout. Staff confirm the order on `#staff` → `confirm_order(id, total)`
  checks `is_staff()`, locks the order row (`for update`), refuses if it's not `pending`, and adds
  `floor(total) × points_per_dollar` to the customer once.
- Staff can enter the final total at confirm time, so a total the customer's browser sent can't inflate points.
- In-store purchases: staff scan the customer's QR card (`staff_find_card`, `staff_add_purchase`).

### Redeeming a reward
`redeem_reward(tier)` subtracts the points in one statement that also checks the balance
(`... where id = auth.uid() and points >= cost`) and creates a code like `BL-4821`. Staff check it with `use_code`,
which locks the row so a code can't be used twice.

### Owners editing the site
Owners' changes are saved as JSON in `site_content` through `owner_save`, which checks `is_owner()` (or
`is_social()` for promos, announcements and best sellers only) and writes a line to `change_log`. The site loads the code's menu first,
applies the saved changes on top, and caches the last version in the browser so prices show instantly.

## 3. Security model

- **The publishable key is public by design.** It identifies the project; it doesn't grant anything by itself.
- **RLS on every table.** Customers read only their own profile, orders and codes; staff read all.
- **Column grants:** customers may update only `name`, `phone` and `whatsapp_offers` on their profile. They can't
  touch `points`, `is_staff` or `is_owner`.
- **Writes through `SECURITY DEFINER` functions** that check the caller's role first, with a fixed `search_path`.
  Role checks in the UI only hide buttons; the real check is in the database.
- **Never in the repo:** the service_role key and the Google client secret.

## 4. Decisions and trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| Supabase instead of my own server | One person maintains it; free tier; Auth, Storage and Postgres included | Business logic lives in SQL functions, which are harder to test and version than app code |
| WhatsApp for order delivery | The shop already runs on WhatsApp; no new app for staff | Depends on the customer pressing Send; the saved order is the source of truth |
| Points only on staff confirmation | Stops fake or cancelled orders earning points | Points appear later, not instantly |
| Menu in code + edits in the database | Site still works if the database is down; owners can't break the base menu | Two sources to merge (`applyContent`) |
| Single-file build (`vite-plugin-singlefile`) | Started as a file the owners could double-click; still simple to deploy | One large HTML file (~1.5 MB, ~575 KB gzipped); no code splitting |
| Hash routes (`#staff`, `#editor`) | No router or server rewrites needed | Not ideal for SEO, which is fine for private pages |
| All text in one translation table | Every string must exist in English and Arabic; `dir="rtl"` set on `<html>` | Translations live in code, not editable by owners |

## 5. What I'd do differently / next

- **Move business logic into a FastAPI service** (orders, points, rewards) with unit tests and Docker, and keep
  Postgres as the database. That gives proper tests, logs and an API other apps could use.
- **Tests:** SQL function tests (e.g. pgTAP) and an end-to-end checkout test (Playwright).
- **Code splitting:** load `#staff` and `#editor` separately so customers download less.
- **Monitoring:** error tracking and a daily sales summary for the owners.

## 6. Questions I expect, with short answers

- **"Isn't putting the Supabase key in the frontend insecure?"** It's the publishable key, which is designed to be
  public. Access is controlled by RLS, column grants and role checks inside the functions.
- **"What stops a customer giving themselves points?"** They can't update `points` (column grants), and the only
  functions that add points check `is_staff()`.
- **"What if two staff confirm the same order at once?"** `confirm_order` locks the row with `select ... for update`
  and refuses anything that isn't `pending`, so points are added once.
- **"Why not a normal backend?"** For one café, Supabase was the fastest safe option. The next step is a FastAPI
  service for the business logic. See section 5.
- **"How did you handle Arabic?"** A translation table for every string, `dir="rtl"` on the page, CSS that uses
  logical directions, and a dedicated Arabic font (Readex Pro).
