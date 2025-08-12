import { FixedTimestep } from '../util/time';
import { Balance } from '../config/balance';
import { makeEnemy, makePlayer, makeBullet, Enemy, Bullet, Player, stepEnemy, stepBullet, collide } from './entities';

export type GameState = {
  player: {
    x:number; y:number;
    hp:number; maxHP:number;
    bulletDamage:number;
    reload:number;
    bulletsPerShot:number;
    spreadRadians:number;
    attackSpeed:number;
    reloadTimer:number;
  };
  enemies: Enemy[];
  bullets: Bullet[];
  spawnTimer: number;
  spawnInterval: number;
  timeAlive: number;
}

export class Game {
  ctx: CanvasRenderingContext2D;
  state: GameState;
  loop = new FixedTimestep(1/60);
  paused = false;
  reducedMotion = false;

  // Feedback
  private flash = 0; // 0..1 flash on hit

  // Intensity multipliers: damped in Focus for calmer visuals
  private speedMul = 1;
  private spawnMul = 1;
  private fireMul  = 1;

  constructor(private canvas: HTMLCanvasElement){
    const ctx = canvas.getContext('2d')!;
    this.ctx = ctx;
    const w = canvas.width, h = canvas.height;
    this.state = {
      player: {
        x: w/2, y: h*0.75,
        hp: Balance.player.maxHP, maxHP: Balance.player.maxHP,
        bulletDamage: Balance.player.bulletDamage,
        reload: Balance.player.reload,
        bulletsPerShot: Balance.player.bulletsPerShot,
        spreadRadians: Balance.player.spreadRadians,
        attackSpeed: Balance.player.attackSpeed,
        reloadTimer: 0
      },
      enemies: [],
      bullets: [],
      spawnTimer: Balance.enemy.baseSpawnInterval,
      spawnInterval: Balance.enemy.baseSpawnInterval,
      timeAlive: 0
    };
  }

  setIntensity(mode: 'calm'|'active'){
    if (mode === 'calm'){ this.speedMul = 0.6; this.spawnMul = 0.55; this.fireMul = 0.7; }
    else { this.speedMul = 1; this.spawnMul = 1; this.fireMul = 1; }
  }

  applyUpgrade(fn:(s:GameState)=>void){ fn(this.state); }
  setReducedMotion(v:boolean){ this.reducedMotion = v; }
  spendPlayerHP(d:number){ this.state.player.hp = Math.max(0, this.state.player.hp - d); }
  get playerHP(){ return this.state.player.hp; }
  get playerMax(){ return this.state.player.maxHP; }

  update(dt:number){
    if(this.paused) return;

    const s = this.state;
    s.timeAlive += dt;

    // Spawn logic scaling (affected by intensity)
    s.spawnInterval = Math.max(
      Balance.enemy.minSpawnInterval,
      (Balance.enemy.baseSpawnInterval - (s.timeAlive/60)*Balance.enemy.spawnAccelPerMin) / this.spawnMul
    );

    s.spawnTimer -= dt;
    if(s.spawnTimer <= 0){
      s.spawnTimer += s.spawnInterval;
      const x = Math.random()*this.ctx.canvas.width;
      const eHP = Balance.enemy.baseHP + (s.timeAlive/60)*Balance.enemy.hpGrowthPerMin;
      s.enemies.push(makeEnemy(x, -20, eHP));
    }

    // Auto fire (affected by intensity)
    s.player.reloadTimer -= dt * s.player.attackSpeed * this.fireMul;
    if(s.player.reloadTimer <= 0){
      s.player.reloadTimer += s.player.reload;
      // shoot towards nearest enemy or straight up
      let tx = s.player.x, ty = 0;
      if(s.enemies.length){
        const n = s.enemies.reduce((a,b)=> (Math.abs(b.y - s.player.y) < Math.abs(a.y - s.player.y) ? b : a), s.enemies[0]);
        tx = n.x; ty = n.y;
      }
      for(let i=0;i<s.player.bulletsPerShot;i++){
        const ang = Math.atan2(ty - s.player.y, tx - s.player.x);
        const jitter = (Math.random()-0.5) * s.player.spreadRadians;
        const a = ang + jitter;
        const speed = 260;
        s.bullets.push(makeBullet(s.player.x, s.player.y-10, Math.cos(a)*speed, Math.sin(a)*speed, s.player.bulletDamage));
      }
    }

    // Step enemies (affected by intensity)
    for(const e of s.enemies){
      stepEnemy(e, dt, s.player.x, s.player.y, Balance.enemy.speed * this.speedMul);
      if(collide(e, {x:s.player.x, y:s.player.y, hp:s.player.hp})){
        const before = s.player.hp;
        s.player.hp = Math.max(0, s.player.hp - 5*dt);
        if (s.player.hp < before) this.flash = 1; // got hit
      }
    }

    // Step bullets
    for(const b of s.bullets){ stepBullet(b, dt); }

    // Bullet-enemy collisions (AABB-ish)
    for(const b of s.bullets){
      for(const e of s.enemies){
        if(Math.abs(b.x - e.x) < 14 && Math.abs(b.y - e.y) < 14){
          e.hp -= b.dmg;
          b.life = 0;
        }
      }
    }

    // Cleanup
    s.enemies = s.enemies.filter(e=> e.hp>0 && e.y < this.ctx.canvas.height + 40);
    s.bullets = s.bullets.filter(b=> b.life>0 && b.y>-40 && b.y<this.ctx.canvas.height+40);

    // decay flash
    this.flash = Math.max(0, this.flash - dt * 2.5);
  }

  draw(){
    const ctx = this.ctx;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.clearRect(0,0,w,h);

    // Dim the scene slightly when in calm intensity (Focus)
    if (this.fireMul < 1 || this.spawnMul < 1 || this.speedMul < 1) {
      ctx.globalAlpha = 0.9;
    } else {
      ctx.globalAlpha = 1;
    }

    // subtle shake on hit (skip if reduced motion)
    if (this.flash > 0 && !this.reducedMotion) {
      const mag = 2 * this.flash; // px
      ctx.save();
      ctx.translate((Math.random()-0.5)*mag, (Math.random()-0.5)*mag);
    }

    // player
    ctx.beginPath();
    ctx.arc(this.state.player.x, this.state.player.y, 12, 0, Math.PI*2);
    ctx.fillStyle = '#9bd7ff';
    ctx.fill();

    // enemies
    ctx.fillStyle = '#ff6b6b';
    for(const e of this.state.enemies){
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10, 0, Math.PI*2);
      ctx.fill();
    }

    // bullets
    ctx.fillStyle = '#a78bfa';
    for(const b of this.state.bullets){
      ctx.beginPath();
      ctx.rect(b.x-2, b.y-6, 4, 12);
      ctx.fill();
    }

    if (this.flash > 0 && !this.reducedMotion) ctx.restore();

    // flash overlay
    if (this.flash > 0){
      ctx.fillStyle = `rgba(255,80,80,${0.18 * this.flash})`;
      ctx.fillRect(0,0,w,h);
    }

    ctx.globalAlpha = 1;
  }
}
