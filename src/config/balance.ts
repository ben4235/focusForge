export const Balance = {
  // Points (nerfed for saner pacing)
  basePointsPer25: 120,
  streakBonusPct: 0.12,
  longSessionScalarPer5Min: 0.25,
  allowShopWhilePaused: false, // set true if you want shop in Pause
  rerollBaseCost: 25,
  rerollCostScale: 1.45,

  // Enemy/Combat (smoother early game)
  enemy: {
    baseSpawnInterval: 2.0,
    minSpawnInterval: 0.8,
    spawnAccelPerMin: 0.14,
    baseHP: 10,
    hpGrowthPerMin: 1.8,
    speed: 2
  },
  player: {
    maxHP: 100,
    reload: 0.6,
    bulletDamage: 2,
    bulletsPerShot: 1,
    spreadRadians: 0.10,
    attackSpeed: 1.0
  }
} as const;
