import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/archivo-black'
import '@fontsource-variable/outfit'
import '@fontsource-variable/readex-pro'
import './styles.css'
import App from './App'
import { CartProvider } from './CartContext'
import { LangProvider } from './i18n'
import { RewardsProvider } from './RewardsContext'
import { ContentProvider } from './ContentContext'
import { applyContent, readCache } from './data/content'

// open with the owners' last saved changes (refreshed from the database right after)
applyContent(readCache() || {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <CartProvider>
        <RewardsProvider>
          <ContentProvider>
            <App />
          </ContentProvider>
        </RewardsProvider>
      </CartProvider>
    </LangProvider>
  </StrictMode>
)
