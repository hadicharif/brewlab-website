// ─────────────────────────────────────────────────────────────
//  Website content that owners change in the editor (#editor).
//  The code's own menu/prices/promos are the starting point; the
//  changes saved in the database (site_content) are laid on top.
//  The last version is cached in the browser so the site opens
//  with the right prices straight away, then it's refreshed.
// ─────────────────────────────────────────────────────────────
import { menu, sections, setWhatsApp, setInstagram, setLargeExtra, WHATSAPP_NUMBER, INSTAGRAM_URL, LARGE_EXTRA } from './menu'
import { ADDON_PRICES, milks, FREE_FLAVOURS } from './drinkLab'
import { announcements, promos, bestSellers } from './promos'
import { ITEM_PHOTOS } from './photos'
import { setHours, OPEN_HOUR, CLOSE_HOUR } from '../hours'
import { NAMES, WORDS } from '../i18n'

const clone = (x) => JSON.parse(JSON.stringify(x))

// ─── The code's own values (so a removed change goes back to them) ──
const BASE_ITEMS = menu.map((m) => ({ ...m }))
const BASE_IDS = new Set(BASE_ITEMS.map((m) => m.id))
const BASE_PHOTOS = { ...ITEM_PHOTOS }
const BASE_NAMES = { ...NAMES }
export const DEFAULTS = {
  addons: {
    flavour: ADDON_PRICES.flavour, shot: ADDON_PRICES.shot, cream: ADDON_PRICES.cream, decaf: ADDON_PRICES.decaf,
    large: LARGE_EXTRA,
    milk: Object.fromEntries(milks.filter((m) => m.id !== 'regular').map((m) => [m.id, m.price])),
    free: [...FREE_FLAVOURS],
  },
  shop: { open: OPEN_HOUR, close: CLOSE_HOUR, whatsapp: WHATSAPP_NUMBER, instagram: INSTAGRAM_URL, closedOn: null },
  promos: clone(promos),
  announcements: clone(announcements),
  bestsellers: clone(bestSellers),
}

// A promo card links to an item, a menu section or the drink builder
export const promoLink = (p) => (p.lab ? 'lab' : p.item ? `item:${p.item}` : p.section ? `section:${p.section}` : 'lab')
const fromLink = (link) => {
  const [kind, id] = String(link || 'lab').split(':')
  return kind === 'item' ? { item: id } : kind === 'section' && sections[id] ? { section: id } : { lab: true }
}

const replaceAll = (arr, items) => { arr.splice(0, arr.length, ...items) }
const num = (v, fallback) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : fallback)

// ─── Apply saved content to the live data ────────────────────
export function applyContent(c = {}) {
  // menu
  const m = c.menu || {}
  const over = m.items || {}
  for (const k of Object.keys(ITEM_PHOTOS)) delete ITEM_PHOTOS[k]
  Object.assign(ITEM_PHOTOS, BASE_PHOTOS)
  for (const k of Object.keys(NAMES)) if (!(k in BASE_NAMES)) delete NAMES[k]
  const items = BASE_ITEMS.map((b) => {
    const o = over[b.id] || {}
    const it = { ...b }
    if (o.price !== undefined) it.price = o.price === null ? null : num(o.price, b.price)
    if (o.name) it.name = o.name
    if (o.desc !== undefined) { it.desc = o.desc || undefined; it.descAr = o.descAr || undefined }
    it.soldOut = !!o.soldOut
    it.hidden = !!o.hidden
    if (o.photo) ITEM_PHOTOS[b.id] = o.photo
    if (o.photo === '') delete ITEM_PHOTOS[b.id]
    return it
  })
  for (const a of m.added || []) {
    if (!a?.id || BASE_IDS.has(a.id) || !sections[a.section] || !a.name) continue
    items.push({
      id: a.id, section: a.section, name: a.name, price: a.price == null ? null : num(a.price, null),
      desc: a.desc || undefined, descAr: a.descAr || undefined, soldOut: !!a.soldOut, hidden: !!a.hidden, added: true,
    })
    if (a.nameAr) NAMES[a.id] = a.nameAr
    if (a.photo) ITEM_PHOTOS[a.id] = a.photo
  }
  replaceAll(menu, items)

  // add-on prices
  const ad = c.addons || {}
  for (const k of ['flavour', 'shot', 'cream', 'decaf']) ADDON_PRICES[k] = num(ad[k], DEFAULTS.addons[k])
  const large = num(ad.large, DEFAULTS.addons.large)
  setLargeExtra(large)
  // "Medium, large +$1" under sized sections
  const amt = Number.isInteger(large) ? large : large.toFixed(2)
  const note = `Medium, large +$${amt}`
  WORDS[note] = `وسط، الكبير +${amt}$`
  for (const sec of Object.values(sections)) if (sec.sized) sec.note = note
  for (const mk of milks) if (mk.id !== 'regular') mk.price = num(ad.milk?.[mk.id], DEFAULTS.addons.milk[mk.id])
  replaceAll(FREE_FLAVOURS, Array.isArray(ad.free) ? ad.free : DEFAULTS.addons.free)

  // shop info
  const sh = c.shop || {}
  const open = Number.isInteger(sh.open) && sh.open >= 0 && sh.open <= 23 ? sh.open : DEFAULTS.shop.open
  const close = Number.isInteger(sh.close) && sh.close >= 1 && sh.close <= 24 ? sh.close : DEFAULTS.shop.close
  setHours(open, close, sh.closedOn || null)
  setWhatsApp(/^\d{8,15}$/.test(sh.whatsapp || '') ? sh.whatsapp : DEFAULTS.shop.whatsapp)
  setInstagram(/^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/.test(sh.instagram || '') ? sh.instagram : DEFAULTS.shop.instagram)

  // promos, announcements, best sellers
  replaceAll(promos, Array.isArray(c.promos)
    ? c.promos.filter((p) => p?.title?.en).map((p, i) => ({
      id: p.id || `p${i}`, tone: ['peach', 'white', 'charcoal'].includes(p.tone) ? p.tone : 'peach',
      tag: p.tag || { en: '', ar: '' }, title: p.title, body: p.body || { en: '', ar: '' }, cta: p.cta || { en: 'See more', ar: 'شاهد المزيد' },
      ...fromLink(p.link),
    }))
    : clone(DEFAULTS.promos))
  replaceAll(announcements, Array.isArray(c.announcements) ? c.announcements.filter((a) => a?.en) : clone(DEFAULTS.announcements))
  const bs = c.bestsellers || DEFAULTS.bestsellers
  bestSellers.drinks = Array.isArray(bs.drinks) ? [...bs.drinks] : [...DEFAULTS.bestsellers.drinks]
  bestSellers.desserts = Array.isArray(bs.desserts) ? [...bs.desserts] : [...DEFAULTS.bestsellers.desserts]
}

// ─── Browser cache ───────────────────────────────────────────
const CACHE = 'brewlab-content'
export function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE) || 'null') } catch { return null }
}
export function writeCache(c) {
  try { localStorage.setItem(CACHE, JSON.stringify(c)) } catch { /* private mode */ }
}

// The code's own version of an item (for "back to original")
export const baseItem = (id) => BASE_ITEMS.find((b) => b.id === id)
export const isBaseItem = (id) => BASE_IDS.has(id)
export const basePhoto = (id) => BASE_PHOTOS[id]
