# Focus Forge

Mobile-first Pomodoro + idle combat sandbox. Primary: focus timer. Secondary: break-only upgrades that affect a simple combat sim. Zero-install PWA. Deployable to GitHub Pages.

## Quick Start
```bash
npm i
npm run dev
```
Open http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
1. Create repo named **focus-forge** (or adjust `vite.config.ts` base).
2. In repo settings, enable Pages -> Deploy from GitHub Actions.
3. Push code. The provided workflow `.github/workflows/deploy.yml` will build and publish `dist/`.

## iOS Audio
You must tap **Enable Chime** once; iOS blocks autoplay. A "Test chime" button lets you verify.

## Data
- Local save: `localStorage["ff-save-v1"]`
- Hard Reset wipes all progress

## Acceptance Criteria covered
- Timers with Start/Pause/Reset & pause freeze
- Rewards granted only on completed Focus (configurable curve)
- Shop: 1-of-3 during Break (config: allow while Paused)
- Combat sandbox: auto-fire, enemies path toward player, contact damage, health bar
- Save/Load
- Audio chime gated by user tap
- Mobile polish: big buttons, safe-area-friendly, 60fps target
- PWA: manifest + service worker
- GitHub Pages workflow

## Config
See `src/config/balance.ts` (point gain, spawn curves).

## Tests
Run `npm test` to execute basic unit tests for timer math, FSM transitions, and reward calc.
