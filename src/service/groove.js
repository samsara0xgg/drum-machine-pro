// Feel rules shared by the scheduler and the grid, kept outside React so they
// are easy to verify: velocity levels, swing timing, and song order.

// A step stores a level: 0 off, 1 soft, 2 mid, 3 hard. Mid plays a sample at
// its mix gain, exactly as every hit did before levels existed.
export const VELOCITY_GAIN = [0, 0.4, 1, 1.5];

// Snapshots saved before levels stored booleans: a hit becomes mid.
export const toLevel = (step) => (typeof step === "number" ? step : step ? 2 : 0);

// Clicking a pad with the brush: the same level clears it, anything else
// (empty or another level) takes the brush level.
export const paint = (level, brush) => (level === brush ? 0 : brush);

// Swing (MPC-style %) pushes every second 16th late: 50 is straight,
// ~66 a triplet feel, 75 the maximum. Returns the delay in seconds.
export const swingDelay = (step, secondsPer16th, swing) =>
  step % 2 ? (swing / 100 - 0.5) * 2 * secondsPer16th : 0;

// A song plays song.order[pos] (a pattern index) for one bar, then moves on;
// after the last bar it jumps back to song.loopFrom.
export const nextBar = (song, pos) =>
  pos + 1 < song.order.length ? pos + 1 : song.loopFrom;
