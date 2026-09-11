import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

import { ensureAudioReady } from "../src/service/audio.js";
import { pageForStep, stepsForPage } from "../src/service/mobile.js";

test("ensureAudioReady resumes a suspended context from the play gesture", async () => {
  const context = {
    state: "suspended",
    resumeCalls: 0,
    async resume() {
      this.resumeCalls += 1;
      this.state = "running";
    },
  };

  await ensureAudioReady(context);

  assert.equal(context.resumeCalls, 1);
  assert.equal(context.state, "running");
});

test("ensureAudioReady rejects when the browser keeps audio blocked", async () => {
  const context = {
    state: "suspended",
    async resume() {},
  };

  await assert.rejects(
    ensureAudioReady(context),
    /Tap play again to enable audio/
  );
});

test("mobile sequencer divides sixteen steps into four usable pages", () => {
  assert.deepEqual(stepsForPage(0), [0, 1, 2, 3]);
  assert.deepEqual(stepsForPage(3), [12, 13, 14, 15]);
  assert.equal(pageForStep(0), 0);
  assert.equal(pageForStep(7), 1);
  assert.equal(pageForStep(15), 3);
});

test("mobile styles use a four-step grid without sticky overlays", () => {
  const styles = sass.compile(
    fileURLToPath(new URL("../src/component/App.scss", import.meta.url))
  ).css;

  assert.match(styles, /@media \(max-width: 600px\)/);
  assert.match(styles, /\.Screen-param\s*\{[\s\S]*?display:\s*none/);
  assert.match(styles, /\.Screen-right\s*\{[\s\S]*?width:\s*auto/);
  assert.match(styles, /\.Board-pager\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, 1fr\)/);
  assert.match(styles, /\.Board-Channel\s*\{[\s\S]*?grid-template-columns:\s*116px minmax\(0, 1fr\) 24px/);
  assert.match(styles, /\.Board-Channel__group\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, 1fr\)/);
  assert.doesNotMatch(styles, /@media \(max-width: 600px\)[\s\S]*?min-width:\s*868px/);
});
