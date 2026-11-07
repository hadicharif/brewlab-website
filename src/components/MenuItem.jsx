import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, SlidersHorizontal } from 'lucide-react'
import { formatPrice, needsOptions, labLink, sections } from '../data/menu'
import { useCart } from '../CartContext'
import { useLang } from '../i18n'
import { SHOW_DRINK_LAB } from '../config'
import { ITEM_PHOTOS } from '../data/photos'

export default function MenuItem({ item, onChoose, showSection = false }) {
  const { quantities, add, decrement, countFor } = useCart()
  const { t, w, n, lang } = useLang()
  const withOptions = needsOptions(item)
  const qty = withOptions ? countFor(item.id) : quantities[item.id] || 0
  const price = formatPrice(item.price)
  const name = n(item)
  const lab = SHOW_DRINK_LAB && labLink[item.id]

  const customize = () =>
    window.dispatchEvent(new CustomEvent('brewlab:customize', { detail: lab }))

  return (
    <li id={`item-${item.id}`} className={`menu-item${qty ? ' in-cart' : ''}${ITEM_PHOTOS[item.id] ? ' has-photo' : ''}${item.soldOut ? ' is-soldout' : ''}`}>
      {ITEM_PHOTOS[item.id] && <img className="item-photo" src={ITEM_PHOTOS[item.id]} alt="" loading="lazy" decoding="async" width="72" height="72" />}
      <div className="item-main">
        {showSection && <p className="item-section">{w(sections[item.section].label)}</p>}
        <div className="item-line">
          <span className="item-name">{name}</span>
          {price && (
            <>
              <span className="leader" aria-hidden="true" />
              <span className="item-price">{price}</span>
            </>
          )}
        </div>
        {item.desc && <p className="item-desc">{lang === 'ar' ? item.descAr || w(item.desc) : item.desc}</p>}
        <div className="item-meta">
          {lab && !item.soldOut && (
            <button className="item-customize" onClick={customize}>
              <SlidersHorizontal size={14} aria-hidden="true" /> {t('customize')}
            </button>
          )}
          {withOptions && qty > 0 && <span className="item-incart">{t('inCart', qty)}</span>}
        </div>
      </div>

      <div className="item-action">
        {item.soldOut ? (
          <span className="soldout-tag">{t('soldOut')}</span>
        ) : withOptions ? (
          <button className="btn-order" onClick={() => onChoose(item)} aria-label={`${t('order')} ${name}`}>
            {t('order')}
          </button>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="order" className="btn-order" onClick={() => add(item.id)}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}
                aria-label={`${t('order')} ${name}`}
              >
                {t('order')}
              </motion.button>
            ) : (
              <motion.div
                key="stepper" className="stepper"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}
              >
                <button onClick={() => decrement(item.id)} aria-label={`− ${name}`}>
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => add(item.id)} aria-label={`+ ${name}`}>
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </li>
  )
}
