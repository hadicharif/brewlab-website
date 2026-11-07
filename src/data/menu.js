// ─────────────────────────────────────────────────────────────
//  Brew Lab menu — edit this file to change items.
//
//  Prices: every item has `price: null` for now. When you have
//  prices, put the number in (in US dollars), e.g. price: 3.5.
//  Items with sizes use `prices: { Medium: 4, Large: 5 }`.
//  Prices appear on the site automatically once they're filled in.
// ─────────────────────────────────────────────────────────────

export let WHATSAPP_NUMBER = '96170552950' // +961 70 552 950, digits only (owners can change it in the editor)
export const setWhatsApp = (n) => { WHATSAPP_NUMBER = n }
export let INSTAGRAM_URL = 'https://www.instagram.com/brewlab.lb/'
export const setInstagram = (u) => { INSTAGRAM_URL = u }
export const CURRENCY = '$'
export const MAPS_URL = 'https://maps.app.goo.gl/LR5sLTsc4ULBjwvW6'

export const FLAVOURS = [
  'Vanilla', 'Caramel', 'Salted caramel', 'Hazelnut', 'Toffee',
  'White chocolate', 'Chocolate', 'Lotus', 'Nutella', 'Strawberry',
  'Nestle', 'Spanish',
]

// Cold drinks come in Medium and Large; everything else is one size.
export const COLD_SIZES = ['Medium', 'Large']

// The three tabs, and the menu sections inside each one
export const groups = [
  {
    id: 'drinks',
    label: 'Coffee & drinks',
    blurb: 'Hot, iced, blended and fresh.',
    sections: ['hot', 'cold', 'frappe', 'milkshakes', 'smoothies', 'refreshers', 'beverages'],
  },
  {
    id: 'food',
    label: 'Food',
    blurb: 'Croissants, kaak, sandwiches, pasta and salads.',
    sections: ['croissant', 'sandwiches', 'pasta', 'salad'],
  },
  {
    id: 'sweets',
    label: 'Sweets',
    blurb: 'Desserts, crêpes and waffles.',
    sections: ['dessert', 'crepe'],
  },
]

export const sections = {
  hot: { label: 'Hot', note: 'One size' },
  cold: { label: 'Cold', sized: true, note: 'Medium, large +$1' },
  frappe: { label: 'Frappé', sized: true, note: 'Medium, large +$1' },
  milkshakes: { label: 'Milkshakes', sized: true, note: 'Medium, large +$1' },
  smoothies: { label: 'Smoothies', sized: true, note: 'Medium, large +$1' },
  refreshers: { label: 'Refreshers', sized: true, note: 'Medium, large +$1' },
  beverages: { label: 'Beverages' },
  croissant: { label: 'Croissant & kaak' },
  sandwiches: { label: 'Sandwiches' },
  pasta: { label: 'Pasta' },
  salad: { label: 'Salad' },
  dessert: { label: 'Dessert' },
  crepe: { label: 'Crêpe & waffle' },
}

const item = (section, id, name, extra = {}) => ({ id, section, name, price: null, ...extra })
const choice = (id, label, options) => ({ id, label, options })

export const menu = [
  // Hot
  item('hot', 'h-espresso', 'Espresso'),
  item('hot', 'h-double', 'Double espresso'),
  item('hot', 'h-macchiato', 'Macchiato'),
  item('hot', 'h-cortado', 'Cortado'),
  item('hot', 'h-v60', 'V60'),
  item('hot', 'h-turkish', 'Turkish coffee'),
  item('hot', 'h-tea', 'Tea'),
  item('hot', 'h-hotchoc', 'Hot chocolate'),
  item('hot', 'h-nutella', 'Nutella latte'),
  item('hot', 'h-lotus', 'Lotus latte'),
  item('hot', 'h-pistachio', 'Pistachio latte'),
  item('hot', 'h-latte', 'Latte'),
  item('hot', 'h-spanish', 'Spanish latte'),
  item('hot', 'h-cappuccino', 'Cappuccino'),
  item('hot', 'h-americano', 'Americano'),
  item('hot', 'h-mocha', 'Mocha', {
    desc: 'Classic, caramel or white chocolate',
    choices: [choice('style', 'Type', ['Classic', 'Caramel', 'White chocolate'])],
  }),
  item('hot', 'h-matcha', 'Matcha'),

  // Cold
  item('cold', 'c-latte', 'Iced latte'),
  item('cold', 'c-spanish', 'Iced Spanish latte'),
  item('cold', 'c-americano', 'Iced americano'),
  item('cold', 'c-mocha', 'Iced mocha'),
  item('cold', 'c-matcha', 'Iced matcha'),
  item('cold', 'c-flavmatcha', 'Flavored matcha', {
    desc: 'Pick your flavour',
    choices: [choice('flavour', 'Flavour', FLAVOURS)],
  }),
  item('cold', 'c-v60', 'Iced V60'),

  // Frappé
  item('frappe', 'f-chocmocha', 'Chocolate mocha'),
  item('frappe', 'f-caramelmocha', 'Caramel mocha'),
  item('frappe', 'f-whitemocha', 'White mocha'),
  item('frappe', 'f-toffee', 'Toffee coffee'),
  item('frappe', 'f-coffee', 'Coffee'),
  item('frappe', 'f-saltedcaramel', 'Salted caramel'),

  // Milkshakes
  item('milkshakes', 'm-vanilla', 'Vanilla'),
  item('milkshakes', 'm-chocolate', 'Chocolate'),
  item('milkshakes', 'm-strawberry', 'Strawberry'),
  item('milkshakes', 'm-lotus', 'Lotus'),
  item('milkshakes', 'm-oreo', 'Oreo'),
  item('milkshakes', 'm-biscuit', 'Biscuit'),
  item('milkshakes', 'm-nutella', 'Nutella'),

  // Smoothies
  item('smoothies', 's-strawberry', 'Strawberry'),
  item('smoothies', 's-strawmango', 'Strawberry mango'),
  item('smoothies', 's-mango', 'Mango'),
  item('smoothies', 's-mangopassion', 'Mango passion'),
  item('smoothies', 's-passion', 'Passion fruit'),
  item('smoothies', 's-peach', 'Peach'),
  item('smoothies', 's-blueraspberry', 'Blue raspberry'),
  item('smoothies', 's-redfruits', 'Red fruits'),

  // Refreshers
  item('refreshers', 'r-fresh', 'Fresh', {
    desc: 'Orange or lemon',
    choices: [choice('flavour', 'Fresh', ['Orange', 'Lemon'])],
  }),
  item('refreshers', 'r-icedtea', 'Iced tea', {
    desc: 'Peach or mixed fruits',
    choices: [choice('flavour', 'Iced tea', ['Peach', 'Mixed fruits'])],
  }),
  item('refreshers', 'r-mojito', 'Mojito', {
    desc: 'Passion 12 or blue ice',
    choices: [choice('flavour', 'Mojito', ['Passion 12', 'Blue ice'])],
  }),

  // Beverages
  item('beverages', 'b-water', 'Water'),
  item('beverages', 'b-sparkling', 'Sparkling water'),
  item('beverages', 'b-redbull', 'Red Bull'),
  item('beverages', 'b-pepsi', 'Pepsi'),
  item('beverages', 'b-7up', '7 Up'),
  item('beverages', 'b-miranda', 'Miranda'),

  // Croissant & kaak
  item('croissant', 'k-zaatar', 'Croissant zaatar'),
  item('croissant', 'k-jebneh', 'Croissant jebneh'),
  item('croissant', 'k-chocolat', 'Croissant chocolat'),
  item('croissant', 'k-kaake', 'Kaake jebneh'),

  // Sandwiches
  item('sandwiches', 'w-tuna', 'Tuna'),
  item('sandwiches', 'w-tunacado', 'TunaCado'),
  item('sandwiches', 'w-turkey', 'Turkey and cheese'),
  item('sandwiches', 'w-halloumi', 'Halloumi pesto'),
  item('sandwiches', 'w-clubtuna', 'Club sandwich – tuna'),
  item('sandwiches', 'w-clubturkey', 'Club sandwich – turkey & cheese'),

  // Pasta
  item('pasta', 'p-fettuccine', 'Fettuccine pasta', {
    desc: 'Red, white or rosé sauce',
    choices: [choice('sauce', 'Sauce', ['Red sauce', 'White sauce', 'Rosé sauce'])],
    extras: ['Add chicken'],
  }),
  item('pasta', 'p-penne', 'Penne pasta', {
    desc: 'Red, white or rosé sauce',
    choices: [choice('sauce', 'Sauce', ['Red sauce', 'White sauce', 'Rosé sauce'])],
    extras: ['Add chicken'],
  }),

  // Salad
  item('salad', 'l-pasta', 'Pasta salad'),
  item('salad', 'l-tunapasta', 'Tuna pasta'),
  item('salad', 'l-caesar', 'Caesar'),

  // Dessert
  item('dessert', 'd-chocookie', 'Chocolate cookie'),
  item('dessert', 'd-vancookie', 'Vanilla cookie'),
  item('dessert', 'd-lotusballs', 'Lotus balls'),
  item('dessert', 'd-oreoballs', 'Oreo balls'),
  item('dessert', 'd-lazycake', 'Lazy cake'),
  item('dessert', 'd-brownie', 'Brownie'),
  item('dessert', 'd-muffin', 'Muffin'),
  item('dessert', 'd-minicookies', 'Mini cookies'),

  // Crêpe & waffle
  item('crepe', 'x-crepes', 'Mini crêpes', {
    desc: 'Lotus or Nutella',
    choices: [choice('spread', 'Spread', ['Lotus', 'Nutella'])],
  }),
  item('crepe', 'x-waffles', 'Mini waffles', {
    desc: 'Lotus or Nutella',
    choices: [choice('spread', 'Spread', ['Lotus', 'Nutella'])],
  }),
]

// An item opens the options sheet when it has sizes, choices or extras
// ─── Prices in US dollars ─────────────────────────────────────
// Sized drinks: this is the Medium price; Large adds LARGE_EXTRA.
// null = no price yet (the item shows without a price and the cart
// says the total will be confirmed on WhatsApp).
export let LARGE_EXTRA = 1
export const setLargeExtra = (n) => { LARGE_EXTRA = n }

export const PRICES = {
  // Hot
  'h-espresso': 2, 'h-double': 3.33, 'h-macchiato': 3.8, 'h-cortado': 4.5, 'h-v60': 5.5,
  'h-turkish': 3.5, 'h-tea': 3, 'h-hotchoc': 5.5, 'h-nutella': 5, 'h-lotus': 5.5,
  'h-pistachio': 6, 'h-latte': 5.1, 'h-spanish': 6.1, 'h-cappuccino': 5.5, 'h-americano': 4.7, 'h-mocha': 4.7, 'h-matcha': 5,
  // Cold (Medium)
  'c-latte': 5.2, 'c-spanish': 6.2, 'c-americano': 4.5, 'c-mocha': 5.7, 'c-matcha': 5.5, 'c-flavmatcha': 6, 'c-v60': 5.5,
  // Frappé (Medium)
  'f-chocmocha': 5.5, 'f-caramelmocha': 5.5, 'f-whitemocha': 5.5, 'f-toffee': 6, 'f-coffee': 5, 'f-saltedcaramel': 6,
  // Milkshakes (Medium)
  'm-vanilla': 5.5, 'm-chocolate': 5.5, 'm-strawberry': 5.5, 'm-lotus': 6.5, 'm-oreo': 6.5, 'm-biscuit': 6.5, 'm-nutella': 6.5,
  // Smoothies (Medium)
  's-strawberry': 5.5, 's-strawmango': 5.5, 's-mango': 5.5, 's-mangopassion': 5.5,
  's-passion': 5.5, 's-peach': 5.5, 's-blueraspberry': 5.5, 's-redfruits': 5.5,
  // Refreshers (Medium)
  'r-fresh': 3.8, 'r-icedtea': 4.5, 'r-mojito': 5.5,
  // Beverages
  'b-water': 0.56, 'b-sparkling': 2, 'b-redbull': 3.5, 'b-pepsi': 2, 'b-7up': 2, 'b-miranda': 2,
  // Croissant & kaak
  'k-zaatar': 3, 'k-jebneh': 3, 'k-chocolat': 3, 'k-kaake': 3,
  // Sandwiches
  'w-tuna': 5.5, 'w-tunacado': 7.5, 'w-turkey': 6.5, 'w-halloumi': 6.5,
  'w-clubtuna': null, 'w-clubturkey': 3.5,
  // Pasta
  'p-fettuccine': null, 'p-penne': null,
  // Salad
  'l-pasta': 5.5, 'l-tunapasta': 6, 'l-caesar': 6,
  // Dessert
  'd-chocookie': 3.5, 'd-vancookie': 3.5, 'd-lotusballs': 3.5, 'd-oreoballs': 3.5,
  'd-lazycake': 3.5, 'd-brownie': 3.5, 'd-muffin': 3.5, 'd-minicookies': 2,
  // Crêpe & waffle
  'x-crepes': 3.5, 'x-waffles': 3.5,
}
menu.forEach((m) => { m.price = PRICES[m.id] ?? null })

// Extras on menu items (null = price not set yet)
export const EXTRA_PRICES = { 'Add chicken': null }

// Price of a menu item with its size and extras; null if any part is unknown
export function priceFor(it, size, extras = []) {
  if (it.price == null) return null
  let p = it.price + (sections[it.section].sized && size === 'Large' ? LARGE_EXTRA : 0)
  for (const e of extras) {
    if (EXTRA_PRICES[e] == null) return null
    p += EXTRA_PRICES[e]
  }
  return Math.round(p * 100) / 100
}

export const needsOptions = (it) =>
  !!(sections[it.section].sized || it.choices?.length || it.extras?.length)

export const formatPrice = (n) =>
  n == null ? '' : `${CURRENCY}${Number.isInteger(n) ? n : n.toFixed(2)}`

// Menu drinks that can be opened in "Build your drink" (menu id → builder drink id)
export const labLink = {
  'h-espresso': 'espresso', 'h-double': 'double', 'h-macchiato': 'macchiato', 'h-cortado': 'cortado',
  'h-v60': 'v60', 'h-turkish': 'turkish', 'h-tea': 'tea', 'h-hotchoc': 'hotchoc', 'h-nutella': 'nutella',
  'h-lotus': 'lotus', 'h-pistachio': 'pistachio', 'h-latte': 'latte', 'h-spanish': 'spanish', 'h-cappuccino': 'cappuccino',
  'h-americano': 'americano', 'h-mocha': 'mocha', 'h-matcha': 'matcha',
  'c-latte': 'icedlatte', 'c-spanish': 'icedspanish', 'c-americano': 'icedamericano', 'c-mocha': 'icedmocha', 'c-matcha': 'icedmatcha',
  'c-flavmatcha': 'flavmatcha', 'c-v60': 'icedv60',
  'f-chocmocha': 'f-chocmocha', 'f-caramelmocha': 'f-caramelmocha', 'f-whitemocha': 'f-whitemocha',
  'f-toffee': 'f-toffee', 'f-coffee': 'f-coffee', 'f-saltedcaramel': 'f-saltedcaramel',
  'm-vanilla': 'm-vanilla', 'm-chocolate': 'm-chocolate', 'm-strawberry': 'm-strawberry', 'm-lotus': 'm-lotus',
  'm-oreo': 'm-oreo', 'm-biscuit': 'm-biscuit', 'm-nutella': 'm-nutella',
}
