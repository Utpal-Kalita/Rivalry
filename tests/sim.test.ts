import { test } from "node:test";
import assert from "node:assert/strict";
import { generateLevel, replay, initState, step, INPUT, Recorder } from "../lib/game/sim.ts";

test("same seed gives identical level", () => {
  assert.deepEqual(generateLevel("abc", "medium"), generateLevel("abc", "medium"));
  assert.notDeepEqual(generateLevel("abc", "medium"), generateLevel("abd", "medium"));
});

test("a simple bot can finish and the replay matches", () => {
  for (const diff of ["easy", "medium"] as const) {
    let finishedCount = 0;
    for (let k = 0; k < 10; k++) {
      const level = generateLevel("seed" + k, diff);
      const s = initState(level); const rec = new Recorder();
      // bot: run right and jump near gaps/hazards
      for (let t = 0; t < 20000 && !s.finished; t++) {
        const ahead = s.x + 50;
        const ground = level.solids.some(r => r.x <= ahead && r.x + r.w >= ahead && r.y >= s.y);
        const danger = level.spikes.some(sp => sp.x - s.x < 70 && sp.x - s.x > 0);
        const need = !ground || danger || s.vx === 0;
        const mask = INPUT.RIGHT | ((s.onGround && need) || (!s.onGround && s.vy < 0) ? INPUT.JUMP : 0);
        rec.push(mask); step(s, level, mask);
      }
      if (!s.finished) continue;
      finishedCount++;
      const r = replay(level, "fastest", rec.log);
      assert.equal(r.ok, true); assert.equal(r.ticks, s.finishTick);
    }
    assert.ok(finishedCount >= 4, `${diff}: bot finished only ${finishedCount}/10`);
  }
});

test("tampered logs are rejected", () => {
  const level = generateLevel("x", "easy");
  assert.equal(replay(level, "fastest", [[2, 30]]).ok, false);
  assert.equal(replay(level, "fastest", [[9, 1]] as any).ok, false);
});

test("hard levels stay geometrically jumpable", () => {
  for (let k = 0; k < 50; k++) {
    const l = generateLevel("h" + k, "hard");
    const ground = l.solids.filter(r => r.h > 100).sort((a, b) => a.x - b.x);
    for (let i = 1; i < ground.length; i++) {
      assert.ok(ground[i].x - (ground[i - 1].x + ground[i - 1].w) <= 140);
      assert.ok(ground[i - 1].y - ground[i].y <= 60);
    }
  }
});
