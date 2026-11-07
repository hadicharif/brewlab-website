// ─────────────────────────────────────────────────────────────
//  Build-your-drink — the drinks from the Brew Lab menu, the
//  add-ons, and which real cup each drink is served in.
//
//  cup:   'small'   → espresso-size (double-wall glass / mint paper cup)
//         'regular' → stoneware mug (dine-in) / pink paper cup (takeaway)
//         'cold'    → clear cold cup with lid (same for dine-in and takeaway)
//  color: how the drink looks inside the cup
//  milk:  the drink has milk, so a milk choice applies
//  coffee: the drink has coffee, so extra shot and decaf apply
// ─────────────────────────────────────────────────────────────
import { FLAVOURS, COLD_SIZES, LARGE_EXTRA, labLink, menu } from './menu'

export { FLAVOURS }

export const categories = [
  { id: 'hot', label: 'Hot' },
  { id: 'cold', label: 'Cold' },
  { id: 'frappe', label: 'Frappé' },
  { id: 'milkshakes', label: 'Milkshakes' },
]

const ESPRESSO = '#3a2216'
const MILK = '#f4ede0'

export const drinks = [
  // Hot — small cup
  { id: 'espresso', cat: 'hot', name: 'Espresso', cup: 'small', coffee: true, look: 'espresso' },
  { id: 'double', cat: 'hot', name: 'Double espresso', cup: 'small', coffee: true, look: 'espresso' },
  { id: 'macchiato', cat: 'hot', name: 'Macchiato', cup: 'small', coffee: true, milk: true, look: 'macchiato' },
  { id: 'cortado', cat: 'hot', name: 'Cortado', cup: 'small', coffee: true, milk: true, look: 'cortado' },
  { id: 'turkish', cat: 'hot', name: 'Turkish coffee', cup: 'small', coffee: true, look: 'turkish', noFlavour: true },
  // Hot — regular cup
  { id: 'v60', cat: 'hot', name: 'V60', cup: 'regular', coffee: true, color: '#5a2f17' },
  { id: 'tea', cat: 'hot', name: 'Tea', cup: 'regular', color: '#a5532a', teaBag: true, noFlavour: true },
  { id: 'hotchoc', cat: 'hot', name: 'Hot chocolate', cup: 'regular', milk: true, color: '#6b3b25', art: true },
  { id: 'nutella', cat: 'hot', name: 'Nutella latte', cup: 'regular', coffee: true, milk: true, color: '#8a5a3a', art: true },
  { id: 'lotus', cat: 'hot', name: 'Lotus latte', cup: 'regular', coffee: true, milk: true, color: '#b98552', art: true },
  { id: 'pistachio', cat: 'hot', name: 'Pistachio latte', cup: 'regular', coffee: true, milk: true, color: '#b5bf84', art: true },
  { id: 'latte', cat: 'hot', name: 'Latte', cup: 'regular', coffee: true, milk: true, color: '#c39b72', art: true },
  { id: 'spanish', cat: 'hot', name: 'Spanish latte', cup: 'regular', coffee: true, milk: true, color: '#c9a079', art: true },
  { id: 'cappuccino', cat: 'hot', name: 'Cappuccino', cup: 'regular', coffee: true, milk: true, color: '#a87d55', foamy: true },
  { id: 'americano', cat: 'hot', name: 'Americano', cup: 'regular', coffee: true, color: '#3e2418' },
  {
    id: 'mocha', cat: 'hot', name: 'Mocha', cup: 'regular', coffee: true, milk: true, art: true,
    variants: [
      { id: 'classic', name: 'Classic', color: '#6e4430' },
      { id: 'caramel', name: 'Caramel', color: '#8d5c35' },
      { id: 'white', name: 'White chocolate', color: '#c8ab8b' },
    ],
  },
  { id: 'matcha', cat: 'hot', name: 'Matcha', cup: 'regular', milk: true, color: '#a9c27a', art: true },

  // Cold — clear cup, layered, with ice
  { id: 'icedlatte', cat: 'cold', name: 'Iced latte', cup: 'cold', coffee: true, milk: true, layers: ['milk', ESPRESSO] },
  { id: 'icedspanish', cat: 'cold', name: 'Iced Spanish latte', cup: 'cold', coffee: true, milk: true, layers: ['#f1e2c6', ESPRESSO] },
  { id: 'icedamericano', cat: 'cold', name: 'Iced americano', cup: 'cold', coffee: true, layers: ['#3e2418'] },
  { id: 'icedmocha', cat: 'cold', name: 'Iced mocha', cup: 'cold', coffee: true, milk: true, layers: ['#5b3320', 'milk', ESPRESSO] },
  { id: 'icedmatcha', cat: 'cold', name: 'Iced matcha', cup: 'cold', milk: true, layers: ['milk', '#7fa354'] },
  { id: 'flavmatcha', cat: 'cold', name: 'Flavored matcha', cup: 'cold', milk: true, layers: ['milk', '#7fa354'], flavourRequired: true },
  { id: 'icedv60', cat: 'cold', name: 'Iced V60', cup: 'cold', coffee: true, layers: ['#5a2f17'] },

  // Frappé — blended, clear cup with straw
  { id: 'f-chocmocha', cat: 'frappe', name: 'Chocolate mocha frappé', cup: 'cold', coffee: true, blended: '#7a4a32' },
  { id: 'f-caramelmocha', cat: 'frappe', name: 'Caramel mocha frappé', cup: 'cold', coffee: true, blended: '#a8784d' },
  { id: 'f-whitemocha', cat: 'frappe', name: 'White mocha frappé', cup: 'cold', coffee: true, blended: '#d8c0a0' },
  { id: 'f-toffee', cat: 'frappe', name: 'Toffee coffee frappé', cup: 'cold', coffee: true, blended: '#a06c3c' },
  { id: 'f-coffee', cat: 'frappe', name: 'Coffee frappé', cup: 'cold', coffee: true, blended: '#9a6f4e' },
  { id: 'f-saltedcaramel', cat: 'frappe', name: 'Salted caramel frappé', cup: 'cold', coffee: true, blended: '#b8854f' },

  // Milkshakes — blended, clear cup with straw
  { id: 'm-vanilla', cat: 'milkshakes', name: 'Vanilla milkshake', cup: 'cold', blended: '#f3e4bf' },
  { id: 'm-chocolate', cat: 'milkshakes', name: 'Chocolate milkshake', cup: 'cold', blended: '#6e4430' },
  { id: 'm-strawberry', cat: 'milkshakes', name: 'Strawberry milkshake', cup: 'cold', blended: '#f2a3ad' },
  { id: 'm-lotus', cat: 'milkshakes', name: 'Lotus milkshake', cup: 'cold', blended: '#c79560' },
  { id: 'm-oreo', cat: 'milkshakes', name: 'Oreo milkshake', cup: 'cold', blended: '#cfcbc4', speckled: true },
  { id: 'm-biscuit', cat: 'milkshakes', name: 'Biscuit milkshake', cup: 'cold', blended: '#d8b483' },
  { id: 'm-nutella', cat: 'milkshakes', name: 'Nutella milkshake', cup: 'cold', blended: '#7d4f33' },
]

// price: what the milk adds in dollars (0 = free)
export const milks = [
  { id: 'regular', name: 'Regular milk', color: MILK, price: 0 },
  { id: 'skimmed', name: 'Skimmed milk', color: '#f7f4ee', price: 0 },
  { id: 'lactosefree', name: 'Lactose-free milk', color: '#f5efe3', price: 0 },
  { id: 'almond', name: 'Almond milk', color: '#efe2cf', price: 1.5 },
  { id: 'oat', name: 'Oat milk', color: '#ecdfc4', price: 1.5 },
]

export const flavourColors = {
  Vanilla: '#f2dc9c', Caramel: '#c8873a', 'Salted caramel': '#d39a55', Hazelnut: '#9d6b40',
  Toffee: '#b07a3e', 'White chocolate': '#f1e6d2', Chocolate: '#5b3320', Lotus: '#c48d55',
  Nutella: '#6e4430', Strawberry: '#e56f78', Nestle: '#d9b98c', Spanish: '#e8cfa4',
}

export const services = [
  { id: 'dinein', name: 'Dine-in' },
  { id: 'takeaway', name: 'Takeaway' },
]

// multi: the customer can add it more than once
export const extras = [
  { id: 'shot', name: 'Extra shot espresso', coffeeOnly: true, multi: true },
  { id: 'cream', name: 'Cream' },
  { id: 'decaf', name: 'Decaf', coffeeOnly: true },
]

export const defaultDrink = {
  cat: 'hot',
  drink: 'latte',
  variant: null,
  size: COLD_SIZES[0],
  service: 'dinein',
  milk: 'regular',
  flavour: null,     // only for drinks that need one flavour (flavoured matcha)
  flavours: {},      // other drinks: { Caramel: 2, Vanilla: 1 }
  extras: {},        // { shot: 2, cream: 1 }
}

const byId = (list, id) => list.find((o) => o.id === id)

export function resolveDrink(d) {
  const drink = byId(drinks, d.drink)
  const variant = drink.variants ? byId(drink.variants, d.variant) || drink.variants[0] : null
  const sized = drink.cup === 'cold'
  const milk = drink.milk ? byId(milks, d.milk) : null
  const flavours = drink.noFlavour ? []
    : drink.flavourRequired ? [{ name: d.flavour || FLAVOURS[0], n: 1 }]
      : FLAVOURS.filter((f) => d.flavours[f] > 0).map((f) => ({ name: f, n: d.flavours[f] }))
  const flavour = flavours[0]?.name || null
  const ex = extras.filter((e) => d.extras[e.id] > 0 && (!e.coffeeOnly || drink.coffee)).map((e) => ({ ...e, n: d.extras[e.id] }))
  // which of the five real cups to draw
  const cupKind =
    drink.cup === 'cold' ? 'cold'
      : drink.cup === 'small' ? (d.service === 'dinein' ? 'shotglass' : 'mintcup')
        : d.service === 'dinein' ? 'mug' : 'pinkcup'
  return {
    drink, variant, milk, flavour, flavours, extras: ex,
    size: sized ? d.size : null,
    service: byId(services, d.service),
    cupKind,
    lid: drink.cat === 'cold' ? 'sip' : 'straw',
  }
}

// Name in both languages, e.g. "Caramel mocha" / "موكا كراميل"
export function drinkNames(r, NAMES, WORDS) {
  if (r.drink.flavourRequired)
    return { en: `${r.flavour} matcha`, ar: `ماتشا ${WORDS[r.flavour] || r.flavour}` }
  if (r.variant && r.variant.id !== 'classic')
    return { en: `${r.variant.name} ${r.drink.name.toLowerCase()}`, ar: `موكا ${WORDS[r.variant.name]}` }
  const base = NAMES[r.drink.id] || r.drink.name
  const ar = r.drink.cat === 'frappe' ? `فرابيه ${base}` : r.drink.cat === 'milkshakes' ? `ميلك شيك ${base}` : base
  return { en: r.drink.name, ar }
}

// Choices as short English phrases; the site translates them for display
export function drinkParts(r) {
  const parts = []
  if (r.size) parts.push(r.size)
  parts.push(r.service.name)
  if (r.milk && r.milk.id !== 'regular') parts.push(r.milk.name)
  const counted = (n, name) => (n > 1 ? `${n}× ${name}` : name)
  if (!r.drink.flavourRequired) r.flavours.forEach((f) => parts.push(counted(f.n, f.name)))
  r.extras.forEach((e) => parts.push(counted(e.n, e.name)))
  return parts
}

export const drinkId = (r) =>
  ['lab', r.drink.id, r.variant?.id, ...r.flavours.map((f) => `${f.name}${f.n}`), r.size, r.service.id, r.milk?.id, ...r.extras.map((e) => `${e.id}${e.n}`)]
    .filter(Boolean)
    .join('|')

// ─── Prices ───────────────────────────────────────────────────
// Add-on prices in dollars. null = not set yet: the builder then shows
// the drink's price "+ add-ons" and the total is confirmed on WhatsApp.
// (Milk prices are on each milk above.)
export const ADDON_PRICES = {
  flavour: 1,      // any flavour syrup, incl. Spanish (except FREE_FLAVOURS)
  shot: 1,         // extra shot espresso
  cream: 1,
  decaf: 1,
}

// A builder drink is unavailable when its menu item is sold out or hidden
export const drinkUnavailable = (id) => {
  const m = menu.find((x) => x.id === MENU_ID[id])
  return !!(m && (m.soldOut || m.hidden))
}

// Flavours that cost nothing extra
export const FREE_FLAVOURS = ['Nestle']
export const flavourPrice = (f) => (FREE_FLAVOURS.includes(f) ? 0 : ADDON_PRICES.flavour)

// builder drink id → menu item id (to reuse the menu prices)
const MENU_ID = Object.fromEntries(Object.entries(labLink).map(([menuId, labId]) => [labId, menuId]))

// { base, price }: base = drink + size; price = full price, or null if an add-on has no price yet
export function drinkPrice(r) {
  const menuPrice = menu.find((m) => m.id === MENU_ID[r.drink.id])?.price
  if (menuPrice == null) return { base: null, price: null }
  const base = menuPrice + (r.size === 'Large' ? LARGE_EXTRA : 0)
  let price = base + (r.milk?.price || 0)
  if (!r.drink.flavourRequired) r.flavours.forEach((f) => { price += f.n * flavourPrice(f.name) })
  for (const e of r.extras) {
    if (ADDON_PRICES[e.id] == null) { price = null; break }
    price += e.n * ADDON_PRICES[e.id]
  }
  const round = (n) => (n == null ? null : Math.round(n * 100) / 100)
  return { base: round(base), price: round(price) }
}
