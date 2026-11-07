// ─────────────────────────────────────────────────────────────
//  Promotions and best sellers — edit freely.
//  Each text has an English (en) and Arabic (ar) version.
// ─────────────────────────────────────────────────────────────

// Thin bar at the very top of the page; rotates every few seconds.
// Leave the list empty ([]) to hide the bar.
export const announcements = [
  { en: 'Open every day, 8 am to midnight.', ar: 'مفتوح يومياً من ٨ صباحاً حتى منتصف الليل.' },
  { en: 'Order on WhatsApp, pick up in minutes.', ar: 'اطلب عبر واتساب واستلم خلال دقائق.' },
  { en: 'Best seller: try our Mango passion smoothie.', ar: 'الأكثر طلباً: جرّب سموذي مانجا وباشن.' },
  { en: 'Join Brew Lab Rewards: points on every order and a free birthday drink.', ar: 'انضم إلى مكافآت Brew Lab: نقاط مع كل طلب ومشروب مجاني في عيد ميلادك.' },
]

// Promotion cards under the top section.
// A card can open a menu item (item), a menu section (section) or the drink builder (lab).
// tone: 'peach' | 'white' | 'charcoal'
export const promos = [
  {
    id: 'frappe',
    tag: { en: 'Best seller', ar: 'الأكثر طلباً' },
    title: { en: 'Chocolate mocha frappé', ar: 'فرابيه شوكولا موكا' },
    body: { en: 'Our most-ordered cold drink. Medium or large.', ar: 'أكثر مشروب بارد يُطلب عندنا. وسط أو كبير.' },
    cta: { en: 'Order now', ar: 'اطلب الآن' },
    item: 'f-chocmocha',
    tone: 'peach',
  },
  {
    id: 'sweets',
    tag: { en: 'Sweet tooth?', ar: 'بتحب الحلو؟' },
    title: { en: 'Lazy cake, brownie and Oreo balls', ar: 'ليزي كيك، براوني وكرات أوريو' },
    body: { en: 'Our favourite desserts, perfect with any coffee.', ar: 'حلوياتنا المفضّلة، مثالية مع أي قهوة.' },
    cta: { en: 'See desserts', ar: 'شاهد الحلويات' },
    section: 'dessert',
    tone: 'white',
  },
  {
    id: 'lab',
    tag: { en: 'Make it yours', ar: 'على ذوقك' },
    title: { en: 'Build your own drink', ar: 'حضّر مشروبك بنفسك' },
    body: { en: 'Pick the milk, flavour and extras, and see it in our cup.', ar: 'اختر الحليب والنكهة والإضافات وشاهده في كوبنا.' },
    cta: { en: 'Build your drink', ar: 'حضّر مشروبك' },
    lab: true,
    tone: 'charcoal',
  },
]

// Suggested in the pop-up when the customer taps "Send order".
// Up to 2 drinks and 2 desserts that aren't already in the cart are shown.
// Drinks that come in sizes are added as Medium.
export const bestSellers = {
  drinks: ['f-chocmocha', 's-mangopassion'],
  desserts: ['d-oreoballs', 'd-lazycake', 'd-brownie'],
}
