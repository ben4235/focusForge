export function clamp(n:number, a:number, b:number){ return Math.max(a, Math.min(b, n)); }
export function lerp(a:number,b:number,t:number){ return a + (b-a)*t; }
export function len(x:number,y:number){ return Math.hypot(x,y); }
export function norm(x:number,y:number){ const L=len(x,y)||1; return [x/L, y/L] as const; }
