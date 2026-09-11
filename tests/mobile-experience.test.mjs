import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

import { ensureAudioReady } from "../src/service/audio.js";

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

test("mobile styles keep controls visible and pin channel labels", () => {
  const styles = sass.compile(
    fileURLToPath(new URL("../src/component/App.scss", import.meta.url))
  ).css;

  assert.match(styles, /@media \(max-width: 600px\)/);
  assert.match(styles, /\.Screen-param\s*\{[\s\S]*?display:\s*none/);
  assert.match(styles, /\.Screen-right\s*\{[\s\S]*?width:\s*auto/);
  assert.match(styles, /\.Board-Channel__info\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(styles, /\.Board-TopBar__channel\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(styles, /\.Board-scrollHint\s*\{[\s\S]*?display:\s*block/);
});
