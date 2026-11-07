// ─────────────────────────────────────────────────────────────
//  English / Arabic. Edit any Arabic wording here.
//  UI     — labels and messages on the site
//  NAMES  — Arabic names for menu items (by id)
//  WORDS  — Arabic for options, flavours, sections and short phrases
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { OPEN_HOUR, CLOSE_HOUR, fmtHour, isClosedToday } from './hours'

const O = (l) => fmtHour(OPEN_HOUR, l)
const C = (l) => fmtHour(CLOSE_HOUR, l)

export const UI = {
  en: {
    langSwitch: 'عربي',
    langSwitchLabel: 'Switch to Arabic',
    navBuild: 'Build a drink', navMenu: 'Menu', navContact: 'Contact', cart: 'Cart',
    openCart: (n) => `Open cart, ${n} items`,
    heroLede: 'Pick what you like from the menu, add it to your cart, and send the order to us on WhatsApp. We’ll confirm and have it ready.',
    heroBuild: 'Build your drink',
    openNow: () => `Open now, until ${C('en')}`,
    closedNow: () => (isClosedToday() ? 'Closed today' : `Closed now, opens at ${O('en')}`),

    labTitle: 'Build your drink',
    labBlurb: 'Pick a drink and make it yours. You’ll see it in the cup we serve it in.',
    drink: 'Drink', type: 'Type', size: 'Size', oneSize: 'One size',
    service: 'Dine-in or takeaway', milk: 'Milk', flavour: 'Flavour', noFlavour: 'No flavour',
    extras: 'Extras', addToCart: 'Add to cart', added: 'Added', addedToCart: 'Added to cart',
    plusAddons: '+ add-ons', addonsNote: 'Add-on prices are confirmed on WhatsApp.',
    startOver: 'Start over', coldSameCup: 'Cold drinks come in the same cup either way.',

    search: 'Search the menu', clearSearch: 'Clear search',
    results: (n, q) => `${n} ${n === 1 ? 'result' : 'results'} for “${q}”`,
    noResults: (q) => `Nothing matches “${q}”. Try another word, like latte or lotus.`,
    order: 'Order', customize: 'Customize', inCart: (n) => `${n} in your cart`,

    close: 'Close',
    yourOrder: 'Your order', emptyTitle: 'Your cart is empty',
    emptyBody: 'Tap “Order” on any item in the menu to add it here.', browse: 'Browse the menu',
    howWant: 'How do you want it?', pickup: 'Pickup', delivery: 'Delivery',
    yourName: 'Your name', phone: 'Phone', optional: '(optional)', address: 'Delivery address',
    notes: 'Notes', notesPh: 'Oat milk, extra shot, no sugar…',
    pickupTime: 'Pickup time', deliveryTime: 'Delivery time',
    asap: 'As soon as possible', in30: 'In 30 min', in60: 'In 1 hour', chooseTime: 'Choose a time',
    timeLabel: 'Time',
    closedNote: () => `We’re closed right now. We’ll prepare your order when we open at ${O('en')}.`,
    closedToday: 'We’re closed today, so online orders are paused. See you tomorrow!',
    soldOut: 'Sold out',
    remember: 'Remember my details on this phone',
    totalNote: 'We’ll confirm the total when we reply on WhatsApp.',
    subtotal: 'Subtotal', partialNote: 'Items without a price are confirmed when we reply on WhatsApp.',
    total: 'Total', send: 'Send order on WhatsApp',
    errName: 'Add your name so we know who the order is for.',
    errAddress: 'Add a delivery address, or switch to pickup.',
    errTime: () => `Choose a time between ${O('en')} and ${C('en')}.`,
    readyTitle: 'Your order is ready to send',
    readyBody: 'WhatsApp opens with your order typed out. Press send there and we’ll reply to confirm.',
    openWa: 'Open WhatsApp', newOrder: 'Start a new order', editOrder: 'Edit this order',
    viewCart: 'View cart', each: 'each',

    findUs: 'Find us', directions: 'Get directions', hours: () => `Open every day, ${O('en')} to ${C('en')}`,
    askUs: 'Order or ask us anything',
    feedbackLink: 'Tell us how we did',
    feedbackSmall: 'Your feedback',
    privacy: 'Privacy policy',

    waNew: 'New order — Brew Lab', waName: 'Name', waPhone: 'Phone', waType: 'Order type',
    waAddress: 'Address', waNotes: 'Notes', waTime: 'Time', waTotal: 'Total', waSubtotal: 'Subtotal (priced items)',
  },
  ar: {
    langSwitch: 'English',
    langSwitchLabel: 'التبديل إلى الإنجليزية',
    navBuild: 'حضّر مشروبك', navMenu: 'القائمة', navContact: 'تواصل معنا', cart: 'السلة',
    openCart: (n) => `فتح السلة، ${n} أصناف`,
    heroLede: 'اختر ما يعجبك من القائمة، أضفه إلى السلة، وأرسل الطلب إلينا عبر واتساب. نؤكد طلبك ونجهّزه لك.',
    heroBuild: 'حضّر مشروبك',
    openNow: () => `مفتوح الآن حتى ${C('ar')}`,
    closedNow: () => (isClosedToday() ? 'مغلق اليوم' : `مغلق الآن، نفتح الساعة ${O('ar')}`),

    labTitle: 'حضّر مشروبك',
    labBlurb: 'اختر مشروبك وعدّله على ذوقك، وشاهده في الكوب الذي نقدّمه فيه.',
    drink: 'المشروب', type: 'النوع', size: 'الحجم', oneSize: 'حجم واحد',
    service: 'داخل المقهى أو سفري', milk: 'الحليب', flavour: 'النكهة', noFlavour: 'بدون نكهة',
    extras: 'إضافات', addToCart: 'أضف إلى السلة', added: 'تمت الإضافة', addedToCart: 'تمت الإضافة إلى السلة',
    plusAddons: '+ الإضافات', addonsNote: 'نؤكد أسعار الإضافات عبر واتساب.',
    startOver: 'ابدأ من جديد', coldSameCup: 'المشروبات الباردة تُقدَّم في الكوب نفسه في الحالتين.',

    search: 'ابحث في القائمة', clearSearch: 'مسح البحث',
    results: (n, q) => `${n} نتيجة لـ «${q}»`,
    noResults: (q) => `لا توجد نتائج لـ «${q}». جرّب كلمة أخرى مثل لاتيه أو لوتس.`,
    order: 'اطلب', customize: 'خصّص', inCart: (n) => `${n} في سلتك`,

    close: 'إغلاق',
    yourOrder: 'طلبك', emptyTitle: 'سلتك فارغة',
    emptyBody: 'اضغط «اطلب» على أي صنف في القائمة لإضافته هنا.', browse: 'تصفّح القائمة',
    howWant: 'كيف تريد استلام طلبك؟', pickup: 'استلام', delivery: 'توصيل',
    yourName: 'الاسم', phone: 'رقم الهاتف', optional: '(اختياري)', address: 'عنوان التوصيل',
    notes: 'ملاحظات', notesPh: 'حليب شوفان، شوت إضافي، بدون سكر…',
    pickupTime: 'وقت الاستلام', deliveryTime: 'وقت التوصيل',
    asap: 'بأسرع وقت', in30: 'بعد ٣٠ دقيقة', in60: 'بعد ساعة', chooseTime: 'اختر وقتاً',
    timeLabel: 'الوقت',
    closedNote: () => `نحن مغلقون الآن. سنجهّز طلبك عندما نفتح الساعة ${O('ar')}.`,
    closedToday: 'نحن مغلقون اليوم، لذلك الطلب عبر الموقع متوقف. نراكم غداً!',
    soldOut: 'نفد',
    remember: 'احفظ معلوماتي على هذا الهاتف',
    totalNote: 'سنؤكد المجموع عند الرد عليك عبر واتساب.',
    subtotal: 'المجموع الجزئي', partialNote: 'نؤكد سعر الأصناف غير المسعّرة عند الرد عليك عبر واتساب.',
    total: 'المجموع', send: 'أرسل الطلب عبر واتساب',
    errName: 'أضف اسمك لنعرف لمن الطلب.',
    errAddress: 'أضف عنوان التوصيل، أو اختر الاستلام.',
    errTime: () => `اختر وقتاً بين ${O('ar')} و${C('ar')}.`,
    readyTitle: 'طلبك جاهز للإرسال',
    readyBody: 'يُفتح واتساب وفيه طلبك مكتوباً. اضغط إرسال هناك وسنرد عليك للتأكيد.',
    openWa: 'افتح واتساب', newOrder: 'ابدأ طلباً جديداً', editOrder: 'عدّل هذا الطلب',
    viewCart: 'عرض السلة', each: 'للواحد',

    findUs: 'موقعنا', directions: 'احصل على الاتجاهات', hours: () => `مفتوح يومياً من ${O('ar')} حتى ${C('ar')}`,
    askUs: 'للطلب أو لأي سؤال',
    feedbackLink: 'أخبرنا برأيك',
    feedbackSmall: 'رأيك يهمّنا',
    privacy: 'سياسة الخصوصية',

    waNew: 'طلب جديد — Brew Lab', waName: 'الاسم', waPhone: 'الهاتف', waType: 'نوع الطلب',
    waAddress: 'العنوان', waNotes: 'ملاحظات', waTime: 'الوقت', waTotal: 'المجموع', waSubtotal: 'المجموع الجزئي (الأصناف المسعّرة)',
  },
}

// Arabic names of menu items and builder drinks, by id
export const NAMES = {
  'h-espresso': 'إسبريسو', 'h-double': 'دبل إسبريسو', 'h-macchiato': 'ماكياتو', 'h-cortado': 'كورتادو',
  'h-v60': 'V60', 'h-turkish': 'قهوة تركية', 'h-tea': 'شاي', 'h-hotchoc': 'هوت شوكولا',
  'h-nutella': 'لاتيه نوتيلا', 'h-lotus': 'لاتيه لوتس', 'h-pistachio': 'لاتيه فستق', 'h-latte': 'لاتيه', 'h-spanish': 'سبانش لاتيه',
  'h-cappuccino': 'كابتشينو', 'h-americano': 'أمريكانو', 'h-mocha': 'موكا', 'h-matcha': 'ماتشا',
  'c-latte': 'آيس لاتيه', 'c-spanish': 'آيس سبانش لاتيه', 'c-americano': 'آيس أمريكانو', 'c-mocha': 'آيس موكا', 'c-matcha': 'آيس ماتشا',
  'c-flavmatcha': 'ماتشا بنكهة', 'c-v60': 'آيس V60',
  'f-chocmocha': 'شوكولا موكا', 'f-caramelmocha': 'كراميل موكا', 'f-whitemocha': 'وايت موكا',
  'f-toffee': 'توفي كوفي', 'f-coffee': 'قهوة', 'f-saltedcaramel': 'كراميل مملّح',
  'm-vanilla': 'فانيلا', 'm-chocolate': 'شوكولا', 'm-strawberry': 'فراولة', 'm-lotus': 'لوتس',
  'm-oreo': 'أوريو', 'm-biscuit': 'بسكويت', 'm-nutella': 'نوتيلا',
  's-strawberry': 'فراولة', 's-strawmango': 'فراولة ومانجا', 's-mango': 'مانجا', 's-mangopassion': 'مانجا وباشن',
  's-passion': 'باشن فروت', 's-peach': 'دراق', 's-blueraspberry': 'بلو راسبيري', 's-redfruits': 'فواكه حمراء',
  'r-fresh': 'فريش', 'r-icedtea': 'آيس تي', 'r-mojito': 'موهيتو',
  'b-water': 'مياه', 'b-sparkling': 'مياه غازية', 'b-redbull': 'ريد بول', 'b-pepsi': 'بيبسي', 'b-7up': 'سفن أب', 'b-miranda': 'ميراندا',
  'k-zaatar': 'كرواسان زعتر', 'k-jebneh': 'كرواسان جبنة', 'k-chocolat': 'كرواسان شوكولا', 'k-kaake': 'كعكة جبنة',
  'w-tuna': 'تونا', 'w-tunacado': 'تونا كادو', 'w-turkey': 'حبش وجبنة', 'w-halloumi': 'حلوم بيستو',
  'w-clubtuna': 'كلوب ساندويش تونا', 'w-clubturkey': 'كلوب ساندويش حبش وجبنة',
  'p-fettuccine': 'باستا فيتوتشيني', 'p-penne': 'باستا بيني',
  'l-pasta': 'سلطة باستا', 'l-tunapasta': 'تونا باستا', 'l-caesar': 'سيزر',
  'd-chocookie': 'كوكي شوكولا', 'd-vancookie': 'كوكي فانيلا', 'd-lotusballs': 'كرات لوتس', 'd-oreoballs': 'كرات أوريو',
  'd-lazycake': 'ليزي كيك', 'd-brownie': 'براوني', 'd-muffin': 'مافن', 'd-minicookies': 'ميني كوكيز',
  'x-crepes': 'ميني كريب', 'x-waffles': 'ميني وافل',
  // builder drinks
  espresso: 'إسبريسو', double: 'دبل إسبريسو', macchiato: 'ماكياتو', cortado: 'كورتادو', turkish: 'قهوة تركية',
  v60: 'V60', tea: 'شاي', hotchoc: 'هوت شوكولا', nutella: 'لاتيه نوتيلا', lotus: 'لاتيه لوتس',
  pistachio: 'لاتيه فستق', latte: 'لاتيه', spanish: 'سبانش لاتيه', cappuccino: 'كابتشينو', americano: 'أمريكانو', mocha: 'موكا', matcha: 'ماتشا',
  icedlatte: 'آيس لاتيه', icedspanish: 'آيس سبانش لاتيه', icedamericano: 'آيس أمريكانو', icedmocha: 'آيس موكا', icedmatcha: 'آيس ماتشا',
  flavmatcha: 'ماتشا بنكهة', icedv60: 'آيس V60',
}

// Translate one option; handles counted ones like "2× Caramel"
export const wordAr = (s) => {
  const m = /^(\d+)× (.+)$/.exec(s)
  return m ? `${m[1]}× ${WORDS[m[2]] ?? m[2]}` : WORDS[s] ?? s
}

// Arabic for every option, section and short phrase
export const WORDS = {
  // groups & sections
  'Coffee & drinks': 'قهوة ومشروبات', Food: 'طعام', Sweets: 'حلويات',
  'Hot, iced, blended and fresh.': 'ساخن، مثلّج، مخفوق وطازج.',
  'Croissants, kaak, sandwiches, pasta and salads.': 'كرواسان، كعك، سندويشات، باستا وسلطات.',
  'Desserts, crêpes and waffles.': 'حلويات، كريب ووافل.',
  Hot: 'ساخن', Cold: 'بارد', 'Frappé': 'فرابيه', Milkshakes: 'ميلك شيك', Smoothies: 'سموذي',
  Refreshers: 'منعشات', Beverages: 'مشروبات', 'Croissant & kaak': 'كرواسان وكعك', Sandwiches: 'سندويشات',
  Pasta: 'باستا', Salad: 'سلطات', Dessert: 'حلويات', 'Crêpe & waffle': 'كريب ووافل',
  'One size': 'حجم واحد', 'Medium, large +$1': 'وسط، الكبير +1$',
  // item descriptions
  'Classic, caramel or white chocolate': 'كلاسيك، كراميل أو شوكولا بيضاء',
  'Pick your flavour': 'اختر النكهة', 'Orange or lemon': 'برتقال أو ليمون',
  'Peach or mixed fruits': 'دراق أو فواكه مشكّلة', 'Passion 12 or blue ice': 'باشن 12 أو بلو آيس',
  'Red, white or rosé sauce': 'صلصة حمراء أو بيضاء أو روزيه', 'Lotus or Nutella': 'لوتس أو نوتيلا',
  // choice labels and options
  Type: 'النوع', Flavour: 'النكهة', Fresh: 'فريش', 'Iced tea': 'آيس تي', Mojito: 'موهيتو',
  Sauce: 'الصلصة', Spread: 'الحشوة', Size: 'الحجم', Extras: 'إضافات',
  Classic: 'كلاسيك', Caramel: 'كراميل', 'White chocolate': 'شوكولا بيضاء',
  Orange: 'برتقال', Lemon: 'ليمون', Peach: 'دراق', 'Mixed fruits': 'فواكه مشكّلة',
  'Passion 12': 'باشن 12', 'Blue ice': 'بلو آيس',
  'Red sauce': 'صلصة حمراء', 'White sauce': 'صلصة بيضاء', 'Rosé sauce': 'صلصة روزيه', 'Add chicken': 'إضافة دجاج',
  Lotus: 'لوتس', Nutella: 'نوتيلا', Medium: 'وسط', Large: 'كبير',
  // flavours
  Vanilla: 'فانيلا', 'Salted caramel': 'كراميل مملّح', Hazelnut: 'بندق', Toffee: 'توفي',
  Chocolate: 'شوكولا', Strawberry: 'فراولة', Nestle: 'نستله', Spanish: 'سبانش',
  All: 'الكل',
  // builder
  'Frappé ': 'فرابيه', 'Dine-in': 'داخل المقهى', Takeaway: 'سفري',
  'Regular milk': 'حليب عادي', 'Skimmed milk': 'حليب خالي الدسم', 'Lactose-free milk': 'حليب خالي من اللاكتوز',
  'Almond milk': 'حليب لوز', 'Oat milk': 'حليب شوفان',
  'Extra shot espresso': 'شوت إسبريسو إضافي', Cream: 'كريمة', Decaf: 'منزوع الكافيين',
  // checkout
  Pickup: 'استلام', Delivery: 'توصيل',
}

const LangContext = createContext(null)
const LANG_KEY = 'brewlab-lang'

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try { localStorage.setItem(LANG_KEY, lang) } catch { /* ignore */ }
  }, [lang])

  const value = useMemo(() => {
    const ui = UI[lang]
    return {
      lang,
      rtl: lang === 'ar',
      toggle: () => setLang((l) => (l === 'en' ? 'ar' : 'en')),
      t: (key, ...args) => (typeof ui[key] === 'function' ? ui[key](...args) : ui[key] ?? key),
      // translate an option / phrase
      w: (s) => (lang === 'ar' ? wordAr(s) : s),
      // name of a menu item or builder drink
      n: (obj) => (lang === 'ar' ? NAMES[obj.id] ?? obj.name : obj.name),
    }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

// Search helper: lower-case and fold Arabic letter variants
export const fold = (s) =>
  s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ً-ْ]/g, '')
