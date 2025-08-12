import '../style.css';
import { $, setText, fmtTime } from './ui/dom';
import { PomodoroFSM } from './fsm/PomodoroFSM';
import { Game } from './game/Game';
import { Balance } from './config/balance';
import { AudioGate } from './audio/Audio';
import { loadSave, save, hardReset, SaveData } from './save/Storage';
import { ShopUI } from './ui/shop';
import { FixedTimestep, nowMs } from './util/time';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);
let last = nowMs();
const rafLoop = new FixedTimestep(1/60);

const audio = new AudioGate();
const fsm = new PomodoroFSM();

// State & Save
let points = 0;
let gold = 0;

function persist(){
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

function restore(){
  const s = loadSave();
  if(!s) return;
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

const shop = new ShopUI((u)=>{
  if(points >= u.cost){
    points -= u.cost;
    game.applyUpgrade((state:any)=>u.apply(state));
    shop.close();
    persist();
    updateHUD();
  }
});
shop.bind(()=>points, (n)=>{
  if(points>=n){ points -= n; persist(); updateHUD(); return true; }
  return false;
});

// UI bindings
$('#startBtn')?.addEventListener('click', ()=> fsm.start());
$('#pauseBtn')?.addEventListener('click', ()=> fsm.pause());
$('#resetBtn')?.addEventListener('click', ()=> fsm.reset());
$('#enableSoundBtn')?.addEventListener('click', async ()=>{ await audio.unlock(); await audio.loadChime(); });
$('#testChimeBtn')?.addEventListener('click', ()=> audio.playChime());
$('#hardResetBtn')?.addEventListener('click', ()=>{
  if(confirm('Wipe all progress?')){ hardReset(); location.reload(); }
});
(document.getElementById('focusMins') as HTMLInputElement).addEventListener('change', (e)=>{
  const v = Number((e.target as HTMLInputElement).value);
  fsm.setDurations(v, Number((document.getElementById('breakMins') as HTMLInputElement).value));
  persist();
});
(document.getElementById('breakMins') as HTMLInputElement).addEventListener('change', (e)=>{
  const v = Number((e.target as HTMLInputElement).value);
  fsm.setDurations(Number((document.getElementById('focusMins') as HTMLInputElement).value), v);
  persist();
});
(document.getElementById('reducedMotion') as HTMLInputElement).addEventListener('change', (e)=>{
  const v = (e.target as HTMLInputElement).checked;
  game.setReducedMotion(v); persist();
});

// FSM hooks
fsm.onTick = (left)=>{
  setText('timerDisplay', fmtTime(Math.max(0,left)));
  updateHUD();
};
fsm.onTransition = (to)=>{
  setText('stateChip', to);
  setText('modePill', to);
  // Gate game updates on pause
  game.paused = (to==='Paused');
  // Shop visibility rules
  if(to==='Break'){
    shop.open(points);
  } else if(to==='Paused' && Balance.allowShopWhilePaused){
    shop.open(points);
  } else {
    shop.close();
  }
  updateHUD();
  persist();
};
fsm.onFocusComplete = ()=>{
  // award points
  const focusMin = Number((document.getElementById('focusMins') as HTMLInputElement).value);
  const award = PomodoroFSM.computePointsAward(focusMin*60, fsm.streak);
  points += award;
  setText('gritBadge', `Points: ${points}`);
  audio.playChime();
};

function updateHUD(){
  setText('gritBadge', `Points: ${Math.floor(points)}`);
  setText('goldBadge', `Gold: ${Math.floor(gold)}`);
  setText('streakChip', `Streak: ${fsm.streak}`);
  const hpPct = Math.max(0, Math.min(1, game.playerHP / game.playerMax));
  (document.getElementById('hpFill') as HTMLElement).style.width = `${hpPct*100}%`;
}

// Game + timer loop
let lastT = nowMs();
function frame(){
  const t = nowMs();
  const dt = (t - lastT)/1000;
  lastT = t;

  // Fixed-step update/draw
  game.loop.step(dt, (fixed)=>{
    game.update(fixed);
  });
  if(!(document.getElementById('reducedMotion') as HTMLInputElement).checked){
    game.draw();
  }else{
    // still draw occasionally for visual state
    game.draw();
  }

  // Tick timer at 1-second resolution
  rafLoop.step(dt, ()=>{
    if(fsm.state==='Focus' || fsm.state==='Break'){
      fsm.tick(1);
    }
  });

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(new URL('sw.js', import.meta.env.BASE_URL))
    .catch(() => {});
}


// Touch input: drag to move player horizontally
canvas.addEventListener('pointerdown', onDrag);
canvas.addEventListener('pointermove', onDrag);
function onDrag(e: PointerEvent){
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width/rect.width);
  game.state.player.x = Math.max(12, Math.min(canvas.width-12, x));
}
