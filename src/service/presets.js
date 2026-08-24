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

// A preset can fill several pads: defs[i] = { kit, rows } lands on pad i+1.
// The remaining pads keep pattern 1's lineup with empty steps, and fx can
// carry pitch/pan/reverb so a preset loads with its own master sound.
const payload = (bpm, defs, fx = {}) => ({
  version: 1,
  bpm,
  pitch: fx.pitch ?? 0,
  pan: fx.pan ?? 0,
  reverb: fx.reverb ?? 0,
  patternNum: 0,
  patterns: [...Array(12)].map((_, i) =>
    defs[i]
      ? { kit: defs[i].kit, channels: defs[i].rows }
      : {
          kit: defs[0].kit,
          channels: defs[0].rows.map((r) => ({ ...r, steps: steps([]) })),
        }
  ),
});

export const PRESETS = [
  {
    name: "808 Boom Bap",
    meta: "808 · 98",
    payload: payload(98, [
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 7, 10]),
          row("808", 1, [4, 12]),
          row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 3, [14]),
        ],
      },
    ]),
  },
  {
    name: "707 House",
    meta: "707 · 133",
    payload: payload(133, [
      {
        kit: "707",
        rows: [
          row("707", 0, [0, 4, 8, 12]),
          row("707", 4, [4, 12]),
          row("707", 3, [2, 6, 10, 14]),
          row("707", 5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
        ],
      },
    ]),
  },
  {
    // The cowbell row is borrowed from the 808 kit — cross-kit mixing demo.
    name: "Linn 80s Pop",
    meta: "Linn · 124",
    payload: payload(124, [
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 8]),
          row("linndrum", 1, [4, 12]),
          row("linndrum", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("linndrum", 7, [4, 12]),
          row("808", 5, [6, 14]),
        ],
      },
    ]),
  },
  {
    // Four pads: main groove, busier variation, percussion break, tom fill.
    // The clave line runs a 3-2 son clave the whole way through.
    name: "808 Electro",
    meta: "808 · 128 · 4 pads",
    payload: payload(128, [
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 10]),
          row("808", 1, [4, 12]),
          row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 3, []),
          row("808", 6, [0, 3, 6, 10, 12]),
          row("808", 5, [0, 4, 8, 12]),
          row("808", 9, []),
          row("808", 10, []),
        ],
      },
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 10, 13]),
          row("808", 1, [4, 12]),
          row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 3, [2, 10]),
          row("808", 6, [0, 3, 6, 10, 12]),
          row("808", 5, [0, 4, 8, 12]),
          row("808", 9, [7]),
          row("808", 10, [15]),
        ],
      },
      {
        kit: "808",
        rows: [
          row("808", 0, []),
          row("808", 1, []),
          row("808", 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
          row("808", 3, [4, 12]),
          row("808", 6, [0, 3, 6, 10, 12]),
          row("808", 5, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 9, [8, 9]),
          row("808", 10, [12, 14]),
        ],
      },
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 8]),
          row("808", 1, [12, 13, 14, 15]),
          row("808", 2, [0, 2, 4, 6, 8, 10]),
          row("808", 3, []),
          row("808", 6, [0, 3, 6]),
          row("808", 5, [0, 4, 8]),
          row("808", 9, [4, 6]),
          row("808", 10, [10, 11]),
        ],
      },
    ]),
  },
  {
    // Half-time trap: snare only on beat 3, hat rolls hand off between the two
    // closed hats; the offbeat tick on pads 3-4 is borrowed from the 808 rimshot.
    name: "Trap Hall",
    meta: "Hip Hop · 140 · 4 pads",
    payload: payload(140, [
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0, 7, 10]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("hiphop", 5, [13, 14, 15]),
          row("hiphop", 3, []),
          row("808", 7, []),
        ],
      },
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0, 7, 10, 13]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("hiphop", 5, [4, 5, 6, 7]),
          row("hiphop", 3, [14]),
          row("808", 7, []),
        ],
      },
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0, 10]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 4, 8, 12]),
          row("hiphop", 5, []),
          row("hiphop", 3, [2, 6, 10, 14]),
          row("808", 7, [3, 11]),
        ],
      },
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 4, 8, 12]),
          row("hiphop", 5, []),
          row("hiphop", 3, []),
          row("808", 7, []),
          row("hiphop", 4, [12, 13, 14, 15]),
        ],
      },
    ]),
  },
  {
    // The Rhythm Ace doing what it was built for: a bossa. Pad 2 opens the
    // hats, pad 3 drops the kick for a percussion passage.
    name: "Ace Bossa",
    meta: "Acetone · 138 · 3 pads",
    payload: payload(138, [
      {
        kit: "acetone",
        rows: [
          row("acetone", 0, [0, 6, 8, 14]),
          row("acetone", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("acetone", 5, [0, 3, 6, 10, 13]),
          row("acetone", 4, [4, 12]),
          row("acetone", 3, []),
          row("acetone", 6, []),
        ],
      },
      {
        kit: "acetone",
        rows: [
          row("acetone", 0, [0, 6, 8, 14]),
          row("acetone", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("acetone", 5, [0, 3, 6, 10, 13]),
          row("acetone", 4, [4, 12]),
          row("acetone", 3, [7, 15]),
          row("acetone", 6, [8]),
        ],
      },
      {
        kit: "acetone",
        rows: [
          row("acetone", 0, []),
          row("acetone", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("acetone", 5, [0, 3, 6, 10, 13]),
          row("acetone", 4, [0, 2, 5, 8, 10, 13]),
          row("acetone", 3, [4, 12]),
          row("acetone", 6, []),
        ],
      },
    ]),
  },
  {
    // 80s boogie: LinnDrum backbeat fattened with the 808 clap layered on top
    // of the snare — a classic cross-kit production trick.
    name: "Linn Boogie",
    meta: "Linn + 808 · 108 · 3 pads",
    payload: payload(108, [
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 5, 8, 10]),
          row("linndrum", 1, [4, 12]),
          row("808", 4, [4, 12]),
          row("linndrum", 2, [0, 2, 3, 4, 6, 8, 10, 11, 12, 14]),
          row("linndrum", 7, [2, 6, 10, 14]),
          row("linndrum", 5, []),
          row("linndrum", 9, []),
          row("linndrum", 10, []),
        ],
      },
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 5, 8, 10, 14]),
          row("linndrum", 1, [4, 12]),
          row("808", 4, [4, 12]),
          row("linndrum", 2, [0, 2, 3, 4, 6, 8, 10, 11, 12, 14]),
          row("linndrum", 7, [2, 6, 10, 14]),
          row("linndrum", 5, [0, 4, 8, 12]),
          row("linndrum", 9, []),
          row("linndrum", 10, []),
        ],
      },
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 8]),
          row("linndrum", 1, [4, 12, 15]),
          row("808", 4, [4, 12]),
          row("linndrum", 2, [0, 2, 4, 6]),
          row("linndrum", 7, []),
          row("linndrum", 5, []),
          row("linndrum", 9, [8, 9]),
          row("linndrum", 10, [12, 13]),
        ],
      },
    ]),
  },
  {
    // Slow dub: one-drop on pad 1, steppers on pad 3, and the whole preset
    // loads with the master reverb up — the fx snapshot in action. The rimshot
    // and tambourine are borrowed from the LinnDrum.
    name: "Dub Echo",
    meta: "808 + Linn · 76 · 3 pads · reverb",
    payload: payload(
      76,
      [
        {
          kit: "808",
          rows: [
            row("808", 0, [8]),
            row("linndrum", 6, [8]),
            row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
            row("808", 3, []),
            row("808", 6, []),
            row("linndrum", 7, [4, 12]),
          ],
        },
        {
          kit: "808",
          rows: [
            row("808", 0, [8, 14]),
            row("linndrum", 6, [8]),
            row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
            row("808", 3, [6]),
            row("808", 6, [3, 11]),
            row("linndrum", 7, [4, 12]),
          ],
        },
        {
          kit: "808",
          rows: [
            row("808", 0, [0, 4, 8, 12]),
            row("linndrum", 6, [8]),
            row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
            row("808", 3, [14]),
            row("808", 6, []),
            row("linndrum", 7, [0, 2, 4, 6, 8, 10, 12, 14]),
          ],
        },
      ],
      { reverb: 0.35 }
    ),
  },
];
