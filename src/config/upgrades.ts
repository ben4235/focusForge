export type UpgradeId =
  | 'bullet_damage'
  | 'reload_speed'
  | 'multi_shot'
  | 'spread'
  | 'player_damage' // reserved for future
  | 'bullets_per_shot'
  | 'attack_speed';

export type UpgradeDef = {
  id: UpgradeId;
  name: string;
  desc: string;
  cost: number;
  apply: (state: any) => void;
};

export const UpgradePool: UpgradeDef[] = [
  {
    id: 'bullet_damage',
    name: 'Sharpened Rounds',
    desc: '+2 bullet damage',
    cost: 30,
    apply: (s)=>{ s.player.bulletDamage += 2; }
  },
  {
    id: 'reload_speed',
    name: 'Quick Mag',
    desc: 'Reload 10% faster',
    cost: 30,
    apply: (s)=>{ s.player.reload *= 0.9; }
  },
  {
    id: 'multi_shot',
    name: 'Forked Barrel',
    desc: '+1 projectile per shot',
    cost: 40,
    apply: (s)=>{ s.player.bulletsPerShot += 1; }
  },
  {
    id: 'spread',
    name: 'Tighter Spread',
    desc: '-20% spread',
    cost: 25,
    apply: (s)=>{ s.player.spreadRadians *= 0.8; }
  },
  {
    id: 'bullets_per_shot',
    name: 'Cluster Volley',
    desc: '+2 projectiles',
    cost: 60,
    apply: (s)=>{ s.player.bulletsPerShot += 2; }
  },
  {
    id: 'attack_speed',
    name: 'Honed Reflexes',
    desc: '+15% attack speed',
    cost: 50,
    apply: (s)=>{ s.player.attackSpeed *= 1.15; }
  }
];
