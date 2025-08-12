export const $ = (sel:string) => document.querySelector(sel) as HTMLElement;

export function setText(id: string, text: string){
  const el = document.getElementById(id);
  if(el) el.textContent = text;
}

export function fmtTime(sec: number){
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
