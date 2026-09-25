// Feel rules shared by the scheduler and the grid, kept outside React so they
// are easy to verify: velocity levels, rolls, swing timing, the DJ filter,
// and song order.

// A step stores a level: 0 off, 1 soft, 2 mid, 3 hard. Mid plays a sample at
// its mix gain, exactly as every hit did before levels existed.
export const VELOCITY_GAIN = [0, 0.4, 1, 1.5];

// Snapshots saved before levels stored booleans: a hit becomes mid.
export const toLevel = (step) => (typeof step === "number" ? step : step ? 2 : 0);

// A step also stores a roll: how many evenly spaced hits it fires (1-4).
// Snapshots without rolls play every step once.
export const toRoll = (roll) => (Number.isInteger(roll) && roll >= 1 && roll <= 4 ? roll : 1);

// Clicking a pad with the brushes: a pad that already matches every brush
// clears; anything else takes them all. Steps and brushes are
// { level, roll }, plus { note, slide } on an 808 row.
export const paint = (step, brush) =>
  Object.keys(brush).every((key) => step[key] === brush[key])
    ? { ...step, level: 0, roll: 1 }
    : { ...step, ...brush };

// A row sounds unless it is muted, or another row is soloed and it isn't.
export const isSilent = (channel, anySolo) => channel.muted || (anySolo && !channel.solo);

// Swing (MPC-style %) pushes every second 16th late: 50 is straight,
// ~66 a triplet feel, 75 the maximum. Returns the delay in seconds.
export const swingDelay = (step, secondsPer16th, swing) =>
  step % 2 ? (swing / 100 - 0.5) * 2 * secondsPer16th : 0;

// How long a step actually lasts once swing moves its neighbours; a roll
// divides this span evenly.
export const stepLength = (step, secondsPer16th, swing) =>
  secondsPer16th +
  swingDelay(step + 1, secondsPer16th, swing) -
  swingDelay(step, secondsPer16th, swing);

// DJ filter knob, -100..100: left closes a low-pass down to 100 Hz, right
// opens a high-pass up to 8 kHz, 0 leaves both wide open. Exponential in Hz,
// so equal knob moves sound like equal moves.
export const filterHz = (value) => ({
  lowpass: value < 0 ? 20000 * (100 / 20000) ** (-value / 100) : 20000,
  highpass: value > 0 ? 20 * (8000 / 20) ** (value / 100) : 20,
});

export const filterLabel = (value) => {
  if (value === 0) return "OFF";
  const hz = value < 0 ? filterHz(value).lowpass : filterHz(value).highpass;
  const text = hz < 1000 ? `${Math.round(hz)} HZ` : `${(hz / 1000).toFixed(1)} KHZ`;
  return (value < 0 ? "LP " : "HP ") + text;
};

// A song plays song.bars[pos] ({ pad, filter?: [from, to] }) for one bar,
// then moves on; after the last bar it jumps back to song.loopFrom.
export const nextBar = (song, pos) =>
  pos + 1 < song.bars.length ? pos + 1 : song.loopFrom;
