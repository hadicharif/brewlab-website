// ─────────────────────────────────────────────────────────────
//  Brew Lab Rewards — example rules, edit when you decide.
// ─────────────────────────────────────────────────────────────

// PREVIEW: points are stored only in the customer's browser and the
// drawer shows a "Preview" label. Switch to the database later.

// points earned for every $1 of an order (rounded down)
export const POINTS_PER_DOLLAR = 10

// what points can be swapped for
export const rewardTiers = [
  { id: 'small', pts: 250, en: 'Croissant or cookie', ar: 'كرواسان أو كوكي' },
  { id: 'coffee', pts: 500, en: 'Any hot coffee', ar: 'أي قهوة ساخنة' },
  { id: 'cold', pts: 750, en: 'Any frappé or milkshake', ar: 'أي فرابيه أو ميلك شيك' },
  { id: 'sandwich', pts: 1000, en: 'Any sandwich', ar: 'أي سندويش' },
]

// birthday drink: available this many days before and after the birthday, once a year
export const BIRTHDAY_WINDOW_DAYS = 3

// points given when someone joins
export const WELCOME_POINTS = 50
