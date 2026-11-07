import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from '../config'

// ─── "Keep me signed in" ──────────────────────────────────────
// Ticked: the login is saved on this device and survives closing the browser.
// Not ticked: it's kept only until the browser tab is closed.
const REMEMBER_KEY = 'brewlab-remember'
const safe = (fn) => { try { return fn() } catch { return null } }
export const getRemember = () => safe(() => localStorage.getItem(REMEMBER_KEY)) !== '0'
export const setRemember = (on) => safe(() => localStorage.setItem(REMEMBER_KEY, on ? '1' : '0'))

const loginStorage = {
  getItem: (k) => safe(() => localStorage.getItem(k)) ?? safe(() => sessionStorage.getItem(k)),
  setItem: (k, v) => {
    const [keep, drop] = getRemember() ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
    safe(() => keep.setItem(k, v)); safe(() => drop.removeItem(k))
  },
  removeItem: (k) => { safe(() => localStorage.removeItem(k)); safe(() => sessionStorage.removeItem(k)) },
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: loginStorage },
    })
  : null

// Run a database call but give up after `ms` (so ordering never hangs)
export async function withTimeout(promise, ms = 5000) {
  let t
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error('timeout')), ms) })
  try { return await Promise.race([promise, timeout]) } finally { clearTimeout(t) }
}
