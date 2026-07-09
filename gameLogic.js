(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PenaltyGameLogic = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const POST_MISS_CHANCE = 0.08;

  const ADJACENCY = {
    "top-left": ["top-center"],
    "top-center": ["top-left", "top-right"],
    "top-right": ["top-center"],
    "bottom-left": ["bottom-center"],
    "bottom-center": ["bottom-left", "bottom-right"],
    "bottom-right": ["bottom-center"],
  };

  const ALL_ZONES = Object.keys(ADJACENCY);
  const CORNER_ZONES = ["top-left", "top-right", "bottom-left", "bottom-right"];

  function pickKeeperZone(shotZone, round, shotHistory, rng) {
    rng = rng || Math.random;
    // Adaptive weighting: keeper leans toward zones the player favors,
    // blended more strongly as the shootout progresses (harder late attempts).
    const blend = Math.min(0.25 + (round - 1) * 0.12, 0.7);
    const totalShots = ALL_ZONES.reduce((sum, z) => sum + (shotHistory[z] || 0), 0);

    const weights = ALL_ZONES.map((z) => {
      const historyWeight = totalShots > 0 ? (shotHistory[z] || 0) / totalShots : 1 / ALL_ZONES.length;
      const uniformWeight = 1 / ALL_ZONES.length;
      return blend * historyWeight + (1 - blend) * uniformWeight;
    });

    const total = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * total;
    for (let i = 0; i < ALL_ZONES.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return ALL_ZONES[i];
    }
    return ALL_ZONES[ALL_ZONES.length - 1];
  }

  function resolveShot(shotZone, round, shotHistory, rng) {
    rng = rng || Math.random;
    const isCorner = CORNER_ZONES.includes(shotZone);

    if (isCorner && rng() < POST_MISS_CHANCE) {
      return { result: "post", keeperZone: null };
    }

    const keeperZone = pickKeeperZone(shotZone, round, shotHistory, rng);

    // Keeper guessed the right side: that's always a save, no matter how late the round.
    if (keeperZone === shotZone) {
      return { result: "saved", keeperZone };
    }

    const isAdjacent = ADJACENCY[shotZone].includes(keeperZone);
    const difficulty = 1 + (round - 1) * 0.06;
    const saveChance = Math.min((isAdjacent ? 0.22 : 0.03) * difficulty, 0.9);

    const saved = rng() < saveChance;
    return { result: saved ? "saved" : "goal", keeperZone };
  }

  return {
    POST_MISS_CHANCE,
    ADJACENCY,
    ALL_ZONES,
    CORNER_ZONES,
    pickKeeperZone,
    resolveShot,
  };
});
