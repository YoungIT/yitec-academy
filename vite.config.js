import { defineConfig } from 'vite'

// BASE_PATH is the URL path the site is served from, e.g. /yitec-academy/ on GitHub Pages.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
})
