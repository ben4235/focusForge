import { defineConfig } from 'vite'

// Works for BOTH user sites (ben4235.github.io) and project sites
const repo = process.env.REPO || '';              // set by Actions
const isPages = !!process.env.GITHUB_PAGES;
const base = isPages
  ? (repo && repo.endsWith('.github.io') ? '/' : `/${repo}/`)
  : '/';

export default defineConfig({
  base,
  build: { target: 'es2020' }
})
