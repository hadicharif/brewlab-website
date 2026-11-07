import { Fragment, useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Menu from './components/Menu'
import DrinkLab from './components/DrinkLab'
import CartDrawer from './components/CartDrawer'
import MobileCartBar from './components/MobileCartBar'
import Footer from './components/Footer'
import { SHOW_DRINK_LAB } from './config'
import { AnnouncementBar, PromoCards } from './components/Promos'
import { groups, menu } from './data/menu'
import RewardsDrawer from './components/RewardsDrawer'
import StaffPage from './components/StaffPage'
import FeedbackPage from './components/FeedbackPage'
import FeedbackStrip from './components/FeedbackStrip'
import { useContent } from './ContentContext'
import EditorPage from './components/EditorPage'

const ROUTES = { '#staff': 'staff', '#feedback': 'feedback', '#editor': 'editor' }
const routeOf = () => ROUTES[window.location.hash.split('?')[0]] || null

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [group, setGroup] = useState('drinks')
  const [route, setRoute] = useState(routeOf)
  const [visit, setVisit] = useState(0) // new key each time a page is opened
  const { version } = useContent()

  useEffect(() => {
    const onHash = () => { setRoute(routeOf()); setVisit((v) => v + 1); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const groupOf = (section) => groups.find((g) => g.sections.includes(section)).id
  const scrollAfterRender = (id, flash) =>
    setTimeout(() => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: flash ? 'center' : 'start' })
      if (flash) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash') }
    }, 350)
  const openItem = (id) => {
    const it = menu.find((m) => m.id === id)
    setGroup(groupOf(it.section))
    scrollAfterRender(`item-${id}`, true)
  }
  const openSection = (s) => {
    setGroup(groupOf(s))
    scrollAfterRender(`sec-${s}`)
  }
  const openLab = () => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })

  const goToGroup = (id) => {
    setGroup(id)
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (route === 'staff') return (<><StaffPage /><RewardsDrawer /></>)
  if (route === 'feedback') return <FeedbackPage key={visit} />
  if (route === 'editor') return (<><EditorPage /><RewardsDrawer /></>)

  return (
    <Fragment key={version}>
      <a className="skip-link" href="#menu">Skip to menu</a>
      <AnnouncementBar />
      <Header onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero onPickGroup={goToGroup} />
        <PromoCards onOpenItem={openItem} onOpenSection={openSection} onOpenLab={openLab} />
        <Menu group={group} onGroupChange={setGroup} />
        {SHOW_DRINK_LAB && <DrinkLab />}
        <FeedbackStrip />
      </main>
      <Footer />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} hidden={cartOpen} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <RewardsDrawer />
    </Fragment>
  )
}
