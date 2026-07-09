const test = require("node:test");
const assert = require("node:assert/strict");
const { ALL_ZONES, CORNER_ZONES, POST_MISS_CHANCE, pickKeeperZone, resolveShot } = require("./gameLogic.js");

function emptyHistory() {
  return Object.fromEntries(ALL_ZONES.map((z) => [z, 0]));
}

test("pickKeeperZone always returns one of the known zones", () => {
  const history = emptyHistory();
  for (const rngValue of [0, 0.2, 0.5, 0.8, 0.999999]) {
    const zone = pickKeeperZone("top-left", 1, history, () => rngValue);
    assert.ok(ALL_ZONES.includes(zone));
  }
});

test("pickKeeperZone leans toward zones the player has favored", () => {
  const history = emptyHistory();
  history["bottom-right"] = 10; // player has shot here every time so far
  // With all weight on history (round pushed high so blend caps at 0.7) and a
  // roll near 1, the heaviest-weighted zone (bottom-right, last in ALL_ZONES)
  // should still be selected.
  const zone = pickKeeperZone("top-left", 10, history, () => 0.999999);
  assert.equal(zone, "bottom-right");
});

test("resolveShot: keeper reading the exact zone is always a save", () => {
  const history = emptyHistory();
  // Uniform weights (empty history) + rng=0.2 lands on ALL_ZONES[1] = 'top-center'.
  const { result, keeperZone } = resolveShot("top-center", 1, history, () => 0.2);
  assert.equal(keeperZone, "top-center");
  assert.equal(result, "saved");
});

test("resolveShot: corner shot can fly off target regardless of the keeper", () => {
  const history = emptyHistory();
  assert.ok(CORNER_ZONES.includes("top-left"));
  const rng = () => POST_MISS_CHANCE / 2; // below the post-miss threshold
  const { result, keeperZone } = resolveShot("top-left", 1, history, rng);
  assert.equal(result, "post");
  assert.equal(keeperZone, null);
});

test("resolveShot: a mismatched, non-adjacent guess with a high save roll is a goal", () => {
  const history = emptyHistory();
  const calls = [0.999999, 0.999999];
  let i = 0;
  const rng = () => calls[i++];
  // First roll (uniform weights) picks the last zone, 'bottom-right', which is
  // neither 'top-center' nor adjacent to it, so the save chance is the 3% floor.
  const { result, keeperZone } = resolveShot("top-center", 1, history, rng);
  assert.equal(keeperZone, "bottom-right");
  assert.notEqual(result, "saved");
  assert.equal(result, "goal");
});

test("resolveShot: an adjacent guess still has a real chance to save", () => {
  const history = emptyHistory();
  const calls = [0.34, 0]; // picks 'top-right' (adjacent to top-center), then a save roll of 0
  let i = 0;
  const rng = () => calls[i++];
  const { result, keeperZone } = resolveShot("top-center", 1, history, rng);
  assert.equal(keeperZone, "top-right");
  assert.equal(result, "saved");
});
