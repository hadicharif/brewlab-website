import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { menu } from './data/menu'
import { CART_KEY } from './config'

const CartContext = createContext(null)
const round2 = (n) => Math.round(n * 100) / 100

// state: { q: { [lineId]: qty }, custom: { [lineId]: { id, baseId, name, desc, price } } }
// Plain menu items use their own id. Items with options (size, sauce…)
// and drinks from the builder are "custom" lines with their own id.
function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, q: { ...state.q, [action.id]: (state.q[action.id] || 0) + 1 } }
    case 'addCustom': {
      const { item } = action
      return {
        q: { ...state.q, [item.id]: (state.q[item.id] || 0) + 1 },
        custom: { ...state.custom, [item.id]: item },
      }
    }
    case 'decrement': {
      if ((state.q[action.id] || 0) <= 1) return drop(state, action.id)
      return { ...state, q: { ...state.q, [action.id]: state.q[action.id] - 1 } }
    }
    case 'remove':
      return drop(state, action.id)
    case 'clear':
      return { q: {}, custom: {} }
    default:
      return state
  }
}

function drop(state, id) {
  const q = { ...state.q }
  const custom = { ...state.custom }
  delete q[id]
  delete custom[id]
  return { q, custom }
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '{}')
    const custom = parsed.custom || {}
    const q = Object.fromEntries(
      Object.entries(parsed.q || {}).filter(
        ([id, n]) => n > 0 && (menu.some((m) => m.id === id) || custom[id])
      )
    )
    return { q, custom }
  } catch {
    return { q: {}, custom: {} }
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — cart still works for this visit */
    }
  }, [state])

  const value = useMemo(() => {
    const menuLines = menu.filter((m) => state.q[m.id])
    const customLines = Object.values(state.custom).filter((c) => state.q[c.id])
    const lines = [...menuLines, ...customLines].map((m) => ({
      ...m,
      qty: state.q[m.id],
      lineTotal: m.price == null ? null : m.price * state.q[m.id],
    }))
    const priced = lines.length > 0 && lines.every((l) => l.price != null)
    // how many of a menu item are in the cart, across all its option combos
    const countFor = (baseId) =>
      lines.filter((l) => (l.baseId || l.id) === baseId).reduce((s, l) => s + l.qty, 0)
    return {
      quantities: state.q,
      lines,
      countFor,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: priced ? round2(lines.reduce((s, l) => s + l.lineTotal, 0)) : null,
      // sum of the lines that have a price (used when some don't)
      subtotal: round2(lines.reduce((s, l) => s + (l.lineTotal ?? 0), 0)),
      hasUnpriced: lines.some((l) => l.price == null),
      add: (id) => dispatch({ type: 'add', id }),
      addCustom: (item) => dispatch({ type: 'addCustom', item }),
      decrement: (id) => dispatch({ type: 'decrement', id }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
