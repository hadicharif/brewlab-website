import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { bestSellers } from '../data/promos'
import { menu, sections, needsOptions, formatPrice, priceFor } from '../data/menu'
import { useCart } from '../CartContext'
import { useLang, NAMES } from '../i18n'
import { ITEM_PHOTOS } from '../data/photos'

const T = {
  en: { title: 'Before you send it…', sub: 'Our best sellers go great with your order.', add: 'Add', added: 'Added', send: 'Send order', back: 'Back to cart', medium: 'Medium' },
  ar: { title: 'قبل أن ترسل طلبك…', sub: 'الأكثر طلباً عندنا يليق بطلبك.', add: 'أضف', added: 'أُضيف', send: 'أرسل الطلب', back: 'العودة إلى السلة', medium: 'وسط' },
}

const sized = (it) => !!sections[it.section].sized
// one-tap items only: plain items, or sized drinks (added as Medium)
export const oneTap = (it) => !needsOptions(it) || (sized(it) && !it.choices?.length && !it.extras?.length)

// best sellers that aren't in the cart yet: up to 2 drinks and 2 desserts
export function useSuggestions(snapshot) {
  const pick = (ids) =>
    ids.map((id) => menu.find((m) => m.id === id)).filter((m) => m && !m.hidden && !m.soldOut)
      .filter((m) => m && oneTap(m) && !snapshot.includes(m.id))
      .slice(0, 2)
  return [...pick(bestSellers.drinks), ...pick(bestSellers.desserts)]
}

// Pop-up shown when the customer taps "Send order"
export default function BestSellers({ items, onSend, onBack }) {
  const { lang, n, w } = useLang()
  const { add, addCustom, countFor } = useCart()
  const L = T[lang]

  const addItem = (it) => {
    if (!sized(it)) return add(it.id)
    addCustom({
      id: `${it.id}|Medium`, baseId: it.id, name: it.name, nameAr: NAMES[it.id] || it.name,
      parts: [sections[it.section].label, 'Medium'], price: priceFor(it, 'Medium'),
    })
  }

  return (
    <motion.div className="upsell-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="upsell" role="dialog" aria-modal="true" aria-labelledby="up-title"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}>
        <h3 id="up-title">{L.title}</h3>
        <p className="upsell-sub">{L.sub}</p>
        <ul className="upsell-list">
          {items.map((it) => {
            const inCart = countFor(it.id) > 0
            const price = sized(it) ? priceFor(it, 'Medium') : it.price
            return (
              <li key={it.id} className={inCart ? 'is-added' : ''}>
                {ITEM_PHOTOS[it.id]
                  ? <img className="upsell-photo" src={ITEM_PHOTOS[it.id]} alt="" />
                  : <span className="upsell-dot" aria-hidden="true" />}
                <span className="upsell-name">
                  {n(it)}
                  {sized(it) && <small className="upsell-size">{w(sections[it.section].label)}{lang === 'ar' ? '، ' : ', '}{L.medium}</small>}
                </span>
                {price != null && <span className="upsell-price">{formatPrice(price)}</span>}
                <button className="upsell-add" onClick={() => addItem(it)} disabled={inCart}>
                  {inCart ? <><Check size={16} strokeWidth={3} /> {L.added}</> : <><Plus size={16} strokeWidth={3} /> {L.add}</>}
                </button>
              </li>
            )
          })}
        </ul>
        <button className="btn-whatsapp" onClick={onSend}>{L.send}</button>
        <button className="btn-reset upsell-back" onClick={onBack}>{L.back}</button>
      </motion.div>
    </motion.div>
  )
}
