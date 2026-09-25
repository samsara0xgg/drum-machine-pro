import assert from "node:assert/strict";
import test from "node:test";

import { nextBar, paint, swingDelay, toLevel } from "../src/service/groove.js";
import { DEMO_SONG } from "../src/service/presets.js";

test("old boolean steps load as mid hits", () => {
  assert.deepEqual([true, false, 0, 1, 3].map(toLevel), [2, 0, 0, 1, 3]);
});

test("the brush draws its level and clears only its own level", () => {
  assert.equal(paint(0, 3), 3);
  assert.equal(paint(1, 3), 3);
  assert.equal(paint(3, 3), 0);
});

test("swing delays only odd 16ths, up to half a 16th at 75%", () => {
  assert.equal(swingDelay(1, 0.2, 50), 0);
  assert.equal(swingDelay(2, 0.2, 75), 0);
  assert.equal(swingDelay(3, 0.2, 75), 0.1);
});

test("the demo song walks its bars, then loops back to the groove", () => {
  const { order, loopFrom } = DEMO_SONG;
  const bars = [0];
  for (let i = 0; i < order.length + 2; i++) bars.push(nextBar(DEMO_SONG, bars.at(-1)));
  assert.deepEqual(bars.slice(0, order.length), order.map((_, i) => i));
  assert.deepEqual(bars.slice(order.length), [loopFrom, loopFrom + 1, loopFrom + 2]);
});

test("every demo tab is 16 steps of valid levels on a real pad", () => {
  const { payload, order } = DEMO_SONG;
  assert.equal(payload.version, 2);
  for (const pattern of payload.patterns) {
    for (const row of pattern.channels) {
      assert.equal(row.steps.length, 16);
      assert.ok(row.steps.every((s) => Number.isInteger(s) && s >= 0 && s <= 3));
    }
  }
  assert.ok(order.every((pad) => pad < payload.patterns.length));
});
