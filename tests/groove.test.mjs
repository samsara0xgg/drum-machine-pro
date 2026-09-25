import assert from "node:assert/strict";
import test from "node:test";

import {
  filterHz,
  filterLabel,
  nextBar,
  paint,
  stepLength,
  swingDelay,
  toLevel,
  toRoll,
} from "../src/service/groove.js";
import { DEMO_SONG } from "../src/service/presets.js";
import {
  HIGHEST_NOTE,
  LOWEST_NOTE,
  driveGains,
  noteName,
  parseNote,
} from "../src/service/bass808.js";

test("old snapshots load: boolean hits become mid, missing rolls fire once", () => {
  assert.deepEqual([true, false, 0, 1, 3].map(toLevel), [2, 0, 0, 1, 3]);
  assert.deepEqual([undefined, 0, 2, 4, 5].map(toRoll), [1, 1, 2, 4, 1]);
});

test("the brushes paint every value and clear only an exact match", () => {
  const brush = { level: 3, roll: 2 };
  assert.deepEqual(paint({ level: 0, roll: 1 }, brush), { level: 3, roll: 2 });
  assert.deepEqual(paint({ level: 3, roll: 1 }, brush), { level: 3, roll: 2 });
  assert.deepEqual(paint({ level: 3, roll: 2 }, brush), { level: 0, roll: 1 });
  // an 808 pad also compares note and slide: another note repaints, not clears
  const bass = { level: 2, roll: 1, note: 29, slide: 1 };
  assert.deepEqual(paint({ level: 2, roll: 1, note: 36, slide: 0 }, bass), bass);
  assert.deepEqual(paint(bass, bass), { ...bass, level: 0, roll: 1 });
});

test("808 notes name and parse the keyboard's two octaves", () => {
  assert.equal(noteName(LOWEST_NOTE), "C1");
  assert.equal(noteName(HIGHEST_NOTE), "B2");
  for (let midi = LOWEST_NOTE; midi <= HIGHEST_NOTE; midi++) {
    assert.equal(parseNote(noteName(midi)), midi);
  }
  assert.throws(() => parseNote("H2"));
});

test("808 drive keeps a full-scale hit at full scale at any setting", () => {
  for (const amount of [0, 45, 100]) {
    const { input, makeup } = driveGains(amount);
    assert.ok(Math.abs(Math.tanh(input * 10) * makeup - 1) < 1e-9);
  }
});

test("swing delays only odd 16ths, and each pair of steps keeps its length", () => {
  assert.equal(swingDelay(1, 0.2, 50), 0);
  assert.equal(swingDelay(2, 0.2, 75), 0);
  assert.equal(swingDelay(3, 0.2, 75), 0.1);
  assert.equal(stepLength(2, 0.2, 75), 0.30000000000000004);
  assert.equal(stepLength(3, 0.2, 75), 0.1);
  assert.equal(stepLength(3, 0.2, 50), 0.2);
});

test("the filter knob is open at 0, low-pass left, high-pass right", () => {
  assert.deepEqual(filterHz(0), { lowpass: 20000, highpass: 20 });
  assert.equal(Math.round(filterHz(-100).lowpass), 100);
  assert.equal(Math.round(filterHz(100).highpass), 8000);
  assert.equal(filterLabel(0), "OFF");
  assert.equal(filterLabel(-100), "LP 100 HZ");
  assert.equal(filterLabel(100), "HP 8.0 KHZ");
});

test("the demo song walks its bars, then loops back to the groove", () => {
  const { bars, loopFrom } = DEMO_SONG;
  const walk = [0];
  for (let i = 0; i < bars.length + 2; i++) walk.push(nextBar(DEMO_SONG, walk.at(-1)));
  assert.deepEqual(walk.slice(0, bars.length), bars.map((_, i) => i));
  assert.deepEqual(walk.slice(bars.length), [loopFrom, loopFrom + 1, loopFrom + 2]);
});

test("every demo tab is 16 steps of valid levels and rolls on a real pad", () => {
  const { payload, bars } = DEMO_SONG;
  assert.equal(payload.version, 2);
  for (const pattern of payload.patterns) {
    for (const row of pattern.channels) {
      assert.equal(row.steps.length, 16);
      assert.equal(row.rolls.length, 16);
      assert.ok(row.steps.every((s) => Number.isInteger(s) && s >= 0 && s <= 3));
      assert.ok(row.rolls.every((r) => Number.isInteger(r) && r >= 1 && r <= 4));
    }
  }
  assert.ok(bars.every(({ pad }) => pad < payload.patterns.length));
  const bassRows = payload.patterns.flatMap((p) => p.channels).filter((c) => c.kit === "synth");
  assert.ok(bassRows.some((c) => c.steps.some(Boolean)), "the demo has a bassline");
  for (const row of bassRows) {
    assert.ok(row.notes.every((n) => n >= LOWEST_NOTE && n <= HIGHEST_NOTE));
    assert.ok(row.slides.every((s) => s === 0 || s === 1));
  }
  assert.equal(bars[0].filter[0], payload.filter, "the song starts where the payload's knob is");
});
