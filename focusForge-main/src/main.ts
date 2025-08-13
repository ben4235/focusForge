import '../style.css';
import { $, setText, fmtTime } from './ui/dom';
import { PomodoroFSM } from './fsm/PomodoroFSM';
import { Game } from './game/Game';
import { Balance } from './config/balance';
import { AudioGate } from './audio/Audio';
import { loadSave, save, hardReset, SaveData } from './save/Storage';
import { ShopUI } from './ui/shop';
import { FixedTimestep, nowMs } from './util/time';
import { TriviaFacts } from './config/trivia';

// -----------------------------
// Small helpers
// -----------------------------
function buzz(ms = 10) { try { (navigator as any).vibrate?.(ms); } catch {} }

const canvas = document.getElementById('game') as HTMLCanvasElement;

// Responsive canvas sizing for phones (no scroll)
function resizeCanvas() {
  const cssW = Math.min(canvas.parentElement!.clientWidth, 420);
  // Keep a tall-phone aspect without pushing the HUD offscreen
  const cssH = Math.min(Math.round(cssW * 1.6), Math.round(window.innerHeight * 0.70));
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width  = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

// -----------------------------
// Core systems
// -----------------------------
const game = new Game(canvas);
const audio = new AudioGate();
const fsm = new PomodoroFSM();

// Tick Pomodoro exactly once per second
const rafLoop = new FixedTimestep(1);

// State & Save
let points = 0;
let gold = 0;

// -----------------------------
// Trivia (shown on Breaks)
// -----------------------------
const FACTS_KEY = 'ff-facts-unlocked';
let seenFacts = new Set<number>();

function loadFacts() {
  try {
    const raw = localStorage.getItem(FACTS_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) seenFacts = new Set(arr);
  } catch {}
}
function saveFacts() {
  try {
    localStorage.setItem(FACTS_KEY, JSON.stringify(Array.from(seenFacts)));
  } catch {}
}
function showRandomFact() {
  const box = document.getElementById('triviaBox') as HTMLElement | null;
  const text = document.getElementById('triviaText') as HTMLElement | null;
  if (!box || !text) return;

  // Prefer unseen
  let candidates: number[] = [];
  for (let i = 0; i < TriviaFacts.length; i++) {
    if (!seenFacts.has(i)) candidates.push(i);
  }
  if (candidates.length === 0) {
    candidates = [...TriviaFacts.keys()];
    seenFacts.clear();
  }
  const idx = candidates[Math.floor(Math.random() * candidates.length)];
  seenFacts.add(idx);
  saveFacts();

  text.textContent = TriviaFacts[idx];
  box.hidden = false;
}
function hideTrivia() {
  const box = document.getElementById('triviaBox') as HTMLElement | null;
  if (box) box.hidden = true;
}
loadFacts();

// -----------------------------
// Persistence
// -----------------------------
function persist() {
  const data: SaveData = {
    points, gold, streak: fsm.streak,
    player: {
      maxHP: game.state.player.maxHP,
      bulletDamage: game.state.player.bulletDamage,
      reload: game.state.player.reload,
      bulletsPerShot: game.state.player.bulletsPerShot,
      spreadRadians: game.state.player.spreadRadians,
      attackSpeed: game.state.player.attackSpeed
    },
    settings: {
      reducedMotion: (document.getElementById('reducedMotion') as HTMLInputElement).checked,
      focusMins: Number((document.getElementById('focusMins') as HTMLInputElement).value),
      breakMins: Number((document.getElementById('breakMins') as HTMLInputElement).value)
    }
  };
  save(data);
}

function restore() {
  const s = loadSave();
  if (!s) return;
  points = s.points; gold = s.gold; fsm.streak = s.streak;

  game.state.player.maxHP = s.player.maxHP;
  game.state.player.hp = s.player.maxHP;
  game.state.player.bulletDamage = s.player.bulletDamage;
  game.state.player.reload = s.player.reload;
  game.state.player.bulletsPerShot = s.player.bulletsPerShot;
  game.state.player.spreadRadians = s.player.spreadRadians;
  game.state.player.attackSpeed = s.player.attackSpeed;

  (document.getElementById('reducedMotion') as HTMLInputElement).checked = s.settings.reducedMotion;
  (document.getElementById('focusMins') as HTMLInputElement).value = String(s.settings.focusMins);
  (document.getElementById('breakMins') as HTMLInputElement).value = String(s.settings.breakMins);

  fsm.setDurations(s.settings.focusMins, s.settings.breakMins);
  game.setReducedMotion(s.settings.reducedMotion);
}
restore();
window.addEventListener('beforeunload', persist);

// -----------------------------
// Shop
// -----------------------------
const shop = new ShopUI((u) => {
  if (points >= u.cost) {
    points -= u.cost;
    game.applyUpgrade((state: any) => u.apply(state));
    shop.close();
    persist();
    updateHUD();
  }
});
shop.bind(() => points, (n) => {
  if (points >= n) { points -= n; persist(); updateHUD(); return true; }
  return false;
});

// -----------------------------
// UI bindings
// -----------------------------
$('#startBtn')?.addEventListener('click', () => { fsm.start(); buzz(10); });
$('#pauseBtn')?.addEventListener('click', () => { fsm.pause(); buzz(10); });
$('#resetBtn')?.addEventListener('click', () => { fsm.reset(); buzz(5); });

$('#enableSoundBtn')?.addEventListener('click', async () => {
  await audio.unlock();
  await audio.loadChime();
});
$('#testChimeBtn')?.addEventListener('click', () => audio.playChime());

$('#hardResetBtn')?.addEventListener('click', () => {
  if (confirm('Wipe all progress?')) { hardReset(); location.reload(); }
});

(document.getElementById('focusMins') as HTMLInputElement).addEventListener('change', (e) => {
  const v = Number((e.target as HTMLInputElement).value);
  fsm.setDurations(v, Number((document.getElementById('breakMins') as HTMLInputElement).value));
  persist();
});
(document.getElementById('breakMins') as HTMLInputElement).addEventListener('change', (e) => {
  const v = Number((e.target as HTMLInputElement).value);
  fsm.setDurations(Number((document.getElementById('focusMins') as HTMLInputElement).value), v);
  persist();
});
(document.getElementById('reducedMotion') as HTMLInputElement).addEventListener('change', (e) => {
  const v = (e.target as HTMLInputElement).checked;
  game.setReducedMotion(v);
  // When reduced motion is on during Focus, keep intensity extra calm
  if (fsm.state === 'Focus') game.setIntensity(v ? 'calm' : 'calm');
  persist();
});

// -----------------------------
// FSM hooks
// -----------------------------
fsm.onTick = (left) => {
  setText('timerDisplay', fmtTime(Math.max(0, left)));
  updateHUD();
};

fsm.onTransition = (to) => {
  setText('stateChip', to);
  setText('modePill', to);

  // Pause gate: halts game updates
  game.paused = (to === 'Paused');

  // Calm visuals on Focus, lively on Break/Idle
  if (to === 'Focus') game.setIntensity('calm'); else game.setIntensity('active');

  // Trivia and Shop visibility
  if (to === 'Break') {
    showRandomFact();
    shop.open(points);
  } else if (to === 'Paused' && Balance.allowShopWhilePaused) {
    shop.open(points);
    hideTrivia();
  } else {
    shop.close();
    hideTrivia();
  }

  updateHUD();
  persist();
};

fsm.onFocusComplete = () => {
  // award points (use FSM helper if available)
  const focusMin = Number((document.getElementById('focusMins') as HTMLInputElement).value);
  const award = PomodoroFSM.computePointsAward
    ? PomodoroFSM.computePointsAward(focusMin * 60, fsm.streak)
    : Math.max(1, Math.round(focusMin)); // fallback
  points += award;
  setText('gritBadge', `Points: ${points}`);
  audio.playChime();
  buzz(20);
};

// -----------------------------
// HUD
// -----------------------------
function updateHUD() {
  setText('gritBadge', `Points: ${Math.floor(points)}`);
  setText('goldBadge', `Gold: ${Math.floor(gold)}`);
  setText('streakChip', `Streak: ${fsm.streak}`);
  const hpPct = Math.max(0, Math.min(1, game.playerHP / game.playerMax));
  (document.getElementById('hpFill') as HTMLElement).style.width = `${hpPct * 100}%`;
}

// -----------------------------
// Game + timer loop
// -----------------------------
let lastT = nowMs();
function frame() {
  const t = nowMs();
  const dt = (t - lastT) / 1000; // seconds
  lastT = t;

  // Fixed-step update/draw (game has its own accumulator)
  game.loop.step(dt, (fixed) => { game.update(fixed); });
  game.draw();

  // Tick Pomodoro at 1‑second cadence
  rafLoop.step(dt, () => {
    if (fsm.state === 'Focus' || fsm.state === 'Break') fsm.tick(1);
  });

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// -----------------------------
// PWA SW (Pages-safe path)
// -----------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(new URL('sw.js', import.meta.env.BASE_URL))
    .catch(() => {});
}

// -----------------------------
// Touch input: drag to move player horizontally
// -----------------------------
canvas.addEventListener('pointerdown', onDrag, { passive: true });
canvas.addEventListener('pointermove', onDrag, { passive: true });
function onDrag(e: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  game.state.player.x = Math.max(12, Math.min(canvas.width - 12, x));
}
