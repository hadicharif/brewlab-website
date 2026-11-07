// Site settings.
// SHOW_DRINK_LAB turns the "Build your drink" section on or off.
export const SHOW_DRINK_LAB = true

// where the cart is saved in the customer's browser
export const CART_KEY = 'brewlab-cart-v2'

// ─── Database (Supabase) ──────────────────────────────────────
// The URL and the *publishable* key are safe to have in the website.
// Never put the secret / service_role key here.
export const SUPABASE_URL = 'https://jsdosihotoohepgpeier.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_oIC_au3M-wINlOxUcd_CYw_bG9z22Mj'

// ─── Google sign-in button ───────────────────────────────────
// Keep true once Google is set up in Supabase → Authentication →
// Sign In / Providers. Email login always works.
export const GOOGLE_LOGIN = true

// ─── Google Analytics ─────────────────────────────────────────
// Paste the Measurement ID from analytics.google.com (starts with G-).
// Leave it empty to turn Analytics off.
export const GA_ID = ''
