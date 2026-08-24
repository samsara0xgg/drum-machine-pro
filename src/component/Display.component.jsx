import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Context";

const Screen = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "#000000",
});

const Display = (props) => {
  const { started, setStarted, audioCtx, masterGain, loadedList } =
    useContext(Context);
  const [displayContent] = useState("Drum Machine Pro");

  const start = () => {
    setStarted(!started);
  };

  useEffect(() => {
    // Create a buffer, plop in data, connect and play -> modify graph here if required
    function playSample(audioContext, audioBufferIndex, time) {
      const sampleSource = new AudioBufferSourceNode(audioContext, {
        buffer: loadedList[audioBufferIndex],
      });
      sampleSource.connect(masterGain);
      sampleSource.start(time);
      return sampleSource;
    }

    // Scheduling
    const bpmControl = document.querySelector("#rangeBPM");
    const volumeControl = document.querySelector("#range1");
    let tempo = bpmControl ? parseFloat(bpmControl.value) : 120.0;

    const onTempoChange = (ev) => {
      tempo = parseFloat(ev.target.value);
    };
    const onVolumeChange = (ev) => {
      masterGain.gain.value = parseFloat(ev.target.value) / 100;
    };
    if (bpmControl) {
      bpmControl.addEventListener("input", onTempoChange);
    }
    if (volumeControl) {
      masterGain.gain.value = parseFloat(volumeControl.value) / 100;
      volumeControl.addEventListener("input", onVolumeChange);
    }

    const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

    let currentNote = 0; // The note we are currently playing
    let nextNoteTime = 0.0; // when the next note is due.
    function nextNote() {
      // 16 steps per bar, 4 steps per beat
      const secondsPerStep = 60.0 / tempo / 4;

      nextNoteTime += secondsPerStep;

      // Advance the beat number, wrap to zero when reaching 16
      currentNote = (currentNote + 1) % 16;
    }

    function scheduleNote(beatNumber, time) {
      // Query the pads fresh each step so edits during playback are picked up
      const pads = document.querySelectorAll(".Board-Channel__group");
      pads.forEach((ele, i) => {
        if (ele.querySelectorAll("input")[beatNumber].checked && loadedList[i]) {
          playSample(audioCtx, i, time);
        }
      });
    }

    let timerID;
    function scheduler() {
      // While there are notes that will need to play before the next interval,
      // schedule them and advance the pointer.
      while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(currentNote, nextNoteTime);
        nextNote();
      }
      timerID = setTimeout(scheduler, lookahead);
    }

    if (started) {
      // Check if context is in suspended state (autoplay policy)
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      currentNote = 0;
      nextNoteTime = audioCtx.currentTime;

      scheduler(); // kick off scheduling
    }

    return () => {
      clearTimeout(timerID);
      if (bpmControl) {
        bpmControl.removeEventListener("input", onTempoChange);
      }
      if (volumeControl) {
        volumeControl.removeEventListener("input", onVolumeChange);
      }
    };
  }, [started, loadedList]);
  return (
    <Screen>
      <Typography variant="body1" color="initial">
        {displayContent}
      </Typography>
      <button className="Display-enter" id="test3" onClick={start}>
        {started ? "started" : "paused"}
      </button>
    </Screen>
  );
};
export default Display;
