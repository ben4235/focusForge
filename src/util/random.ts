// Deterministic PRNG (Mulberry32)
export function mulberry32(seed: number){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }
}

export function pickOne<T>(rng: ()=>number, arr: T[]): T{
  return arr[Math.floor(rng()*arr.length)];
}
