import { len, norm } from './math';

export type Vec = {x:number,y:number}
export type Enemy = { x:number, y:number, hp:number }
export type Bullet = { x:number, y:number, vx:number, vy:number, dmg:number, life:number }
export type Player = { x:number, y:number, hp:number }

export function makeEnemy(x:number,y:number,hp:number):Enemy{ return {x,y,hp}; }
export function makeBullet(x:number,y:number,vx:number,vy:number,dmg:number):Bullet{ return {x,y,vx,vy,dmg,life:2.0}; }
export function makePlayer(x:number,y:number,hp:number):Player{ return {x,y,hp}; }

export function stepEnemy(e:Enemy, dt:number, px:number, py:number, speed:number){
  const dx = px - e.x, dy = py - e.y;
  const [nx,ny] = norm(dx,dy);
  e.x += nx * speed * dt;
  e.y += ny * speed * dt;
}

export function stepBullet(b:Bullet, dt:number){
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.life -= dt;
}

export function collide(e:Enemy, p:Player){
  const d = len(e.x - p.x, e.y - p.y);
  return d < 18;
}
