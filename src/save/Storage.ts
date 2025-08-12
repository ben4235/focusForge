const KEY = 'ff-save-v1';
export type SaveData = {
  points: number;
  gold: number;
  streak: number;
  player: {
    maxHP: number;
    bulletDamage: number;
    reload: number;
    bulletsPerShot: number;
    spreadRadians: number;
    attackSpeed: number;
  };
  settings: {
    reducedMotion: boolean;
    focusMins: number;
    breakMins: number;
  }
}

export function loadSave(): SaveData | null {
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch{ return null; }
}

export function save(data: SaveData){
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function hardReset(){
  localStorage.removeItem(KEY);
}
