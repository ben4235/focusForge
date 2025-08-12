export const Balance = {
  // Points (nerfed for saner pacing)
  basePointsPer25: 35,            // was 50
  streakBonusPct: 0.05,           // was 0.10
  longSessionScalarPer5Min: 0.10, // was 0.20
  allowShopWhilePaused: false,    // set true if you want shop in Pause
  rerollBaseCost: 12,
  rerollCostScale: 1.35,

  // Enemy/Combat (smoother early game)
  enemy: {
    baseSpawnInterval: 2.6,   // was 2.0
    minSpawnInterval: 0.8,    // was 0.5
    spawnAccelPerMin: 0.10,   // was 0.15
    baseHP: 8,
    hpGrowthPerMin: 1.5,      // was 2
    speed: 28
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
