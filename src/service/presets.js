// Built-in Library grooves. Each payload is a full v1 snapshot, same shape as a
// share link, so loading one goes through the same hydrate() as /p/:slug.
import { STEP_COUNT } from "./kits";

// Turn a list of step numbers into the bool[16] a channel row stores.
const steps = (on) => Array.from({ length: STEP_COUNT }, (_, i) => on.includes(i));

const row = (kit, slot, on) => ({
  kit,
  slot,
  steps: steps(on),
  muted: false,
  solo: false,
});

// Pattern 1 carries the groove; the other 11 keep the lineup with empty steps.
const payload = (kit, bpm, rows) => ({
  version: 1,
  bpm,
  pitch: 0,
  pan: 0,
  reverb: 0,
  patternNum: 0,
  patterns: [...Array(12)].map((_, i) =>
    i === 0
      ? { kit, channels: rows }
      : { kit, channels: rows.map((r) => ({ ...r, steps: steps([]) })) }
  ),
});

export const PRESETS = [
  {
    name: "808 Boom Bap",
    meta: "808 · 98",
    payload: payload("808", 98, [
      row("808", 0, [0, 7, 10]),
      row("808", 1, [4, 12]),
      row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
      row("808", 3, [14]),
    ]),
  },
  {
    name: "707 House",
    meta: "707 · 133",
    payload: payload("707", 133, [
      row("707", 0, [0, 4, 8, 12]),
      row("707", 4, [4, 12]),
      row("707", 3, [2, 6, 10, 14]),
      row("707", 5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
    ]),
  },
  {
    // The cowbell row is borrowed from the 808 kit — cross-kit mixing demo.
    name: "Linn 80s Pop",
    meta: "Linn · 124",
    payload: payload("linndrum", 124, [
      row("linndrum", 0, [0, 8]),
      row("linndrum", 1, [4, 12]),
      row("linndrum", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
      row("linndrum", 7, [4, 12]),
      row("808", 5, [6, 14]),
    ]),
  },
];
