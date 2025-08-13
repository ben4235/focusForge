export const Balance = {
  // Points (nerfed for saner pacing)
  // Increased base point rewards for completing a 25‑minute Focus
  basePointsPer25: 120,
  // Boost streak bonus so successive sessions feel more rewarding
  streakBonusPct: 0.12,
  // Additional scaling for longer sessions (per extra 5 minutes)
  longSessionScalarPer5Min: 0.25,
  allowShopWhilePaused: false,    // set true if you want shop in Pause
  // Reroll cost now starts higher and scales faster
  rerollBaseCost: 25,
  rerollCostScale: 1.45,

  // Enemy/Combat (smoother early game)
  enemy: {
    // Slightly faster baseline spawn rate for a more engaging early game
    baseSpawnInterval: 2.0,
    minSpawnInterval: 0.8,    // was 0.5
    spawnAccelPerMin: 0.14,
    // Enemies are beefier and scale slightly harder as minutes pass
    baseHP: 10,
    hpGrowthPerMin: 1.8,
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
