import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { track } from './lib/analytics'
import { supabase } from './lib/supabase'
import { POINTS_PER_DOLLAR, rewardTiers as fallbackTiers, BIRTHDAY_WINDOW_DAYS, WELCOME_POINTS } from './data/rewards'

// ─────────────────────────────────────────────────────────────
//  Accounts and rewards, stored in Supabase.
//  Points can only change on the server (staff confirming orders,
//  redeeming rewards); the website only reads them.
// ─────────────────────────────────────────────────────────────

const RewardsContext = createContext(null)

// days between today (Lebanon) and the nearest birthday
function daysFromBirthday(iso) {
  if (!iso) return null
  const [, m, d] = iso.split('-').map(Number)
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut' }).format(new Date()).split('-').map(Number)
  const base = Date.UTC(parts[0], parts[1] - 1, parts[2])
  const diffs = [-1, 0, 1].map((y) => Math.round((Date.UTC(parts[0] + y, m - 1, d) - base) / 86400000))
  return diffs.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a))
}

export function RewardsProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(supabase ? 'loading' : 'offline') // loading | signedOut | needsProfile | ready | offline
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [settings, setSettings] = useState({ ppd: POINTS_PER_DOLLAR, welcome: WELCOME_POINTS, window: BIRTHDAY_WINDOW_DAYS })
  const [tiers, setTiers] = useState(fallbackTiers)

  // rules and rewards (public)
  useEffect(() => {
    if (!supabase) return
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings({ ppd: data.points_per_dollar ?? POINTS_PER_DOLLAR, welcome: data.welcome_points ?? WELCOME_POINTS, window: data.birthday_window_days ?? BIRTHDAY_WINDOW_DAYS })
    })
    supabase.from('reward_tiers').select('*').eq('active', true).order('sort').then(({ data }) => {
      if (data?.length) setTiers(data.map((t) => ({ id: t.id, pts: t.points, en: t.name_en, ar: t.name_ar })))
    })
  }, [])

  // keep track of who is signed in
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setStatus('signedOut')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) { setProfile(null); setHistory([]); setStatus('signedOut') }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadAccount = useCallback(async () => {
    if (!supabase || !session) return
    const uid = session.user.id
    const [{ data: p }, { data: orders }, { data: codes }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('orders').select('id, items, total, status, points, order_type, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
      supabase.from('redemptions').select('kind, tier_id, points, code, status, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    ])
    if (!p) { setStatus('signedOut'); return }
    setProfile(p)
    const h = [
      ...(orders || []).filter((o) => o.status !== 'cancelled').map((o) => ({
        type: o.order_type === 'instore' ? 'instore' : o.status === 'confirmed' ? 'order' : 'pending',
        label: `#${o.id} · ${(o.items || []).slice(0, 2).map((i) => i.name).join(', ')}${(o.items || []).length > 2 ? '…' : ''}`,
        pts: o.status === 'confirmed' ? o.points : 0,
        at: Date.parse(o.created_at),
      })),
      ...(codes || []).map((c) => ({
        type: c.kind === 'birthday' ? 'birthday' : 'redeem', tier: c.tier_id, pts: -c.points, code: c.code, used: c.status === 'used', at: Date.parse(c.created_at),
      })),
    ].sort((a, b) => b.at - a.at)
    setHistory(h)
    // members need a name and a phone number (older accounts are asked for their phone once)
    setStatus(p.name && p.phone ? 'ready' : 'needsProfile')
  }, [session])

  useEffect(() => { loadAccount() }, [loadAccount])

  // a signed-in member with no phone number: open Rewards by itself so they add it
  // (once per visit, and not on the staff/editor pages)
  useEffect(() => {
    if (status !== 'needsProfile') return
    if (/^#(staff|editor)/.test(window.location.hash)) return
    try { if (sessionStorage.getItem('brewlab-asked-phone')) return; sessionStorage.setItem('brewlab-asked-phone', '1') } catch { /* private mode */ }
    const t = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(t)
  }, [status])
  // refresh when the drawer opens (points may have been confirmed since)
  useEffect(() => { if (open) loadAccount() }, [open, loadAccount])

  const value = useMemo(() => {
    const year = Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut', year: 'numeric' }).format(new Date()))
    const diff = profile ? daysFromBirthday(profile.birthday) : null
    const birthdayReady = !!profile && diff != null && Math.abs(diff) <= settings.window && profile.birthday_year !== year
    const account = profile && status === 'ready'
      ? { name: profile.name, birthday: profile.birthday, points: profile.points, birthdayYear: profile.birthday_year, isStaff: profile.is_staff, isOwner: !!profile.is_owner, isSocial: !!profile.is_social, cardCode: profile.card_code, email: session?.user?.email, history }
      : null
    const rpc = async (fn, args) => {
      const { data, error } = await supabase.rpc(fn, args)
      if (error) throw new Error(error.message)
      return data
    }

    return {
      open,
      openRewards: () => setOpen(true),
      closeRewards: () => setOpen(false),
      status,
      session,
      account,
      profile,
      tiers,
      settings,
      birthdayReady,
      pointsFor: (amount) => Math.floor(amount || 0) * settings.ppd,
      refresh: loadAccount,

      // email login link
      sendLink: async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin + window.location.pathname },
        })
        if (error) throw new Error(error.message)
      },
      // Google: leaves the site, comes back signed in
      signInWith: async (provider) => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider, options: { redirectTo: window.location.origin + window.location.pathname },
        })
        if (error) throw new Error(error.message)
      },

      // first-time details after signing in
      saveProfile: async ({ name, phone, birthday, offers }) => {
        const { error } = await supabase.from('profiles').update({ name, phone, whatsapp_offers: !!offers }).eq('id', session.user.id)
        if (error) throw new Error(error.message)
        if (birthday) await rpc('set_birthday', { p_birthday: birthday })
        if (!profile?.name) track('sign_up')
        await loadAccount()
      },
      updateBirthday: async (birthday) => { await rpc('set_birthday', { p_birthday: birthday }); await loadAccount() },
      redeem: async (tierId) => { const c = await rpc('redeem_reward', { p_tier_id: tierId }); track('reward_redeemed', { reward: tierId }); await loadAccount(); return c },
      redeemBirthday: async () => { const c = await rpc('redeem_birthday'); track('reward_redeemed', { reward: 'birthday' }); await loadAccount(); return c },
      signOut: () => supabase.auth.signOut(),
    }
  }, [open, status, session, profile, history, tiers, settings, loadAccount])

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>
}

export const useRewards = () => useContext(RewardsContext)
