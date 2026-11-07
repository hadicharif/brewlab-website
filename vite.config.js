import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// ─── Your website's public address ────────────────────────────
// Fill this in once the site is online (no slash at the end), e.g.
//   const SITE_URL = 'https://brewlab.com'
// then run `npm run build`. It's used for the link preview image
// that shows up when the link is shared on WhatsApp, Instagram, etc.
const SITE_URL = 'https://brewlablb.com'

// puts SITE_URL into the link-preview tags in index.html
const siteUrl = () => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
})

// `npm run build` → normal production build in /dist (for hosting)
// `npm run build:prototype` → one self-contained HTML file in /prototype
//                             that opens by double-clicking, no server needed
export default defineConfig(({ mode }) => ({
  plugins: mode === 'prototype' ? [react(), siteUrl(), viteSingleFile()] : [react(), siteUrl()],
  base: './',
  build: mode === 'prototype' ? { outDir: 'prototype', emptyOutDir: true } : {},
}))
