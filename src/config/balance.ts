export const Balance = {
  // Points
  basePointsPer25: 50,          // nerfed default
  streakBonusPct: 0.10,         // +10% per streak step
  longSessionScalarPer5Min: 0.20, // +20% per extra 5 minutes of focus
  allowShopWhilePaused: false,  // change to true if you want shop during pause
  rerollBaseCost: 10,
  rerollCostScale: 1.5,

  // Enemy/Combat
  enemy: {
    baseSpawnInterval: 2.0,   // seconds
    minSpawnInterval: 0.5,
    spawnAccelPerMin: 0.15,   // decreases interval over time
    baseHP: 8,
    hpGrowthPerMin: 2,
    speed: 28                 // px/sec
  },
  player: {
    maxHP: 100,
    reload: 0.6,
    bulletDamage: 2,
    bulletsPerShot: 1,
    spreadRadians: 0.1,
    attackSpeed: 1.0 // multiplier
  }
} as const
