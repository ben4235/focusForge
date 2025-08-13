export type UpgradeId =
  | 'bullet_damage'
  | 'reload_speed'
  | 'multi_shot'
  | 'spread'
  | 'bullets_per_shot'
  | 'attack_speed';

export type UpgradeDef = {
  id: UpgradeId;
  name: string;
  desc: string;
  cost: number;
  apply: (state: any) => void;
};

// Upgrade pool tuned for more meaningful progression with sensible costs
export const UpgradePool: UpgradeDef[] = [
  {
    id: 'bullet_damage',
    name: 'Sharper Rounds',
    desc: '+2 bullet damage',
    cost: 60,
    apply: (s) => { s.player.bulletDamage += 2; }
  },
  {
    id: 'reload_speed',
    name: 'Quick Mag',
    desc: '-15% reload time (min 0.18s)',
    cost: 65,
    apply: (s) => { s.player.reload *= 0.85; }
  },
  {
    id: 'multi_shot',
    name: 'Twin Shot',
    desc: '+1 extra projectile',
    cost: 70,
    apply: (s) => { s.player.bulletsPerShot += 1; }
  },
  {
    id: 'spread',
    name: 'Tighter Spread',
    desc: '-20% spread cone',
    cost: 40,
    apply: (s) => { s.player.spreadRadians *= 0.8; }
  },
  {
    id: 'bullets_per_shot',
    name: 'Cluster Volley',
    desc: '+2 projectiles',
    cost: 110,
    apply: (s) => { s.player.bulletsPerShot += 2; }
  },
  {
    id: 'attack_speed',
    name: 'Honed Reflexes',
    desc: '+10% attack speed (caps apply)',
    cost: 80,
    apply: (s) => { s.player.attackSpeed *= 1.10; }
  }
];
