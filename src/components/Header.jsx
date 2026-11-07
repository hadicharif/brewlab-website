import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { useRewards } from '../RewardsContext'
import { useCart } from '../CartContext'
import { SHOW_DRINK_LAB } from '../config'
import { useLang } from '../i18n'

export default function Header({ onOpenCart }) {
  const { count } = useCart()
  const { t, toggle, lang } = useLang()
  const { openRewards, account } = useRewards()
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="lockup" aria-label="Brew Lab home">
          <span className="lockup-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="lockup-text">
            <span className="lockup-name">BREW LAB</span>
            <span className="lockup-tag">COFFEE BEACON</span>
          </span>
        </a>
        <nav className="header-nav" aria-label="Main">
          <a href="#menu">{t('navMenu')}</a>
          {SHOW_DRINK_LAB && <a href="#lab">{t('navBuild')}</a>}
          <a href="#visit">{t('navContact')}</a>
        </nav>
        <button className="rewards-button" onClick={openRewards} aria-label={lang === 'ar' ? 'المكافآت' : 'Rewards'}>
          <Star size={18} strokeWidth={2.2} aria-hidden="true" fill={account ? 'currentColor' : 'none'} />
          <span className="rewards-label">{account ? <span dir="ltr">{account.points}</span> : (lang === 'ar' ? 'المكافآت' : 'Rewards')}</span>
        </button>
        <button className="lang-button" onClick={toggle} aria-label={t('langSwitchLabel')} lang={lang === 'en' ? 'ar' : 'en'}>
          {t('langSwitch')}
        </button>
        <button className="cart-button" onClick={onOpenCart} aria-label={t('openCart', count)}>
          <ShoppingBag size={20} strokeWidth={2} />
          <span className="cart-button-label">{t('cart')}</span>
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                className="cart-count"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  )
}
