import assert from "node:assert/strict";
import test from "node:test";

import { paint, swingDelay, toLevel } from "../src/service/groove.js";

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

