import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useContext, useEffect, useRef } from "react";
import { Context } from "../Context";
import { KITS, sampleDef } from "../service/kits";

const Screen = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "#000000",
});

const Display = () => {
  const {
    started,
    setStarted,
    audioCtx,
    masterGain,
    buffersRef,
    patterns,
    patternNum,
    bpm,
    volume,
    currentKit,
  } = useContext(Context);

  // Refs mirror the latest state so the running scheduler reads fresh values
  // (edits and BPM changes are picked up mid-playback) without restarting.
  const channelsRef = useRef(patterns[patternNum].channels);
  const bpmRef = useRef(bpm);
  useEffect(() => {
    channelsRef.current = patterns[patternNum].channels;
    bpmRef.current = bpm;
  });

  useEffect(() => {
    masterGain.gain.value = volume / 100;
  }, [volume, masterGain]);

  useEffect(() => {
    if (!started) {
      return;
    }

    // Check if context is in suspended state (autoplay policy)
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

    let currentNote = 0;
    let nextNoteTime = audioCtx.currentTime;
    let timerID;

    // Schedule every active channel of the current pattern for this step
    const scheduleNote = (beatNumber, time) => {
      const channels = channelsRef.current;
      const anySolo = channels.some((c) => c.solo);

      channels.forEach((channel) => {
        if (!channel.steps[beatNumber]) return;
        if (channel.muted || (anySolo && !channel.solo)) return;

        const def = sampleDef(channel);
        const buffer = buffersRef.current.get(def.sample);
        if (!buffer) return; // still loading

        const source = new AudioBufferSourceNode(audioCtx, { buffer });
        const gainNode = new GainNode(audioCtx, { gain: def.gain });
        source.connect(gainNode);
        gainNode.connect(masterGain);
        source.start(time);
      });
    };

    const scheduler = () => {
      // While there are notes that will need to play before the next interval,
      // schedule them and advance the pointer.
      while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(currentNote, nextNoteTime);
        // 16 steps per bar, 4 steps per beat
        nextNoteTime += 60.0 / bpmRef.current / 4;
        currentNote = (currentNote + 1) % 16;
      }
      timerID = setTimeout(scheduler, lookahead);
    };
    scheduler();

    return () => clearTimeout(timerID);
  }, [started, audioCtx, masterGain, buffersRef]);

  return (
    <Screen>
      <Typography variant="caption" color="initial">
        Drum Machine Pro
      </Typography>
      <Typography variant="body1" color="initial">
        {KITS[currentKit].name} · suggested {KITS[currentKit].suggestedBpm} BPM
      </Typography>
      <button className="Display-enter" onClick={() => setStarted(!started)}>
        {started ? "started" : "paused"}
      </button>
    </Screen>
  );
};
export default Display;
