import { defineConfig } from 'vite'

// Works for both user sites (username.github.io) and project sites
const repo = process.env.REPO || '';
const isPages = !!process.env.GITHUB_PAGES;
const base = isPages
  ? (repo && repo.endsWith('.github.io') ? '/' : `/${repo}/`)
  : '/';

export default defineConfig({
  base,
  build: {
    target: 'es2020'
  }
});
