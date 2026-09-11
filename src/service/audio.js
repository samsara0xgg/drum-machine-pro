// Mobile browsers only allow Web Audio to start from a direct user gesture.
// Keep the policy check outside React so the behavior is easy to verify.
export async function ensureAudioReady(audioCtx) {
  if (audioCtx.state !== "running") {
    await audioCtx.resume();
  }

  if (audioCtx.state !== "running") {
    throw new Error("Tap play again to enable audio");
  }
}
