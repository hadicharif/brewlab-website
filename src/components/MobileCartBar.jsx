import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../CartContext'
import { formatPrice } from '../data/menu'
import { useLang } from '../i18n'

export default function MobileCartBar({ onOpenCart, hidden }) {
  const { count, total, subtotal } = useCart()
  const { t } = useLang()
  return (
    <AnimatePresence>
      {count > 0 && !hidden && (
        <motion.button
          className="mobile-cart-bar"
          onClick={onOpenCart}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        >
          <span className="mcb-count">{count}</span>
          <span className="mcb-label">{t('viewCart')}</span>
          {(total ?? subtotal) > 0 && <span className="mcb-total">{formatPrice(total ?? subtotal)}{total == null ? '+' : ''}</span>}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
