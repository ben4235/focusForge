import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/focus-forge/' : '/',
  build: {
    target: 'es2020'
  }
})
