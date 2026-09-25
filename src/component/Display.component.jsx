import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../Context";
import { KITS, loadSample, sampleDef } from "../service/kits";
import { ensureAudioReady } from "../service/audio";
import {
  VELOCITY_GAIN,
  filterHz,
  filterLabel,
  nextBar,
  stepLength,
  swingDelay,
} from "../service/groove";

// Live oscilloscope of the final mix, faint behind the screen's readouts.
const Scope = ({ analyser, running }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const data = new Uint8Array(analyser.fftSize);
    let rafID;
    const draw = () => {
      const width = (canvas.width = canvas.clientWidth * devicePixelRatio);
      const height = (canvas.height = canvas.clientHeight * devicePixelRatio);
      analyser.getByteTimeDomainData(data);
      ctx.lineWidth = 1.5 * devicePixelRatio;
      ctx.strokeStyle = "rgba(209, 249, 152, 0.3)";
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height / 2 + ((v - 128) / 128) * (height / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      rafID = requestAnimationFrame(draw);
    };
    rafID = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafID);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [analyser, running]);

  return <canvas ref={canvasRef} className="Screen-scope" aria-hidden="true" />;
};

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
    currentStep,
    setCurrentStep,
    nextStepRef,
    songRef,
    showPattern,
    pitch,
    swing,
    setFilter,
    filterNodes,
    analyser,
    flashParam,
    bass,
    bassDecay,
    bassGlide,
    fxIn,
    paramFlash,
    bpmFlash,
    toast,
  } = useContext(Context);

  const [starting, setStarting] = useState(false);

  const togglePlayback = async () => {
    if (started) {
      setStarted(false);
      return;
    }

    setStarting(true);
    try {
      // resume() must happen directly inside this click handler on iOS.
      await ensureAudioReady(audioCtx);
      await Promise.all(
        patterns[patternNum].channels.map((channel) =>
          loadSample(audioCtx, sampleDef(channel).sample, buffersRef.current)
        )
      );
      setStarted(true);
    } catch (error) {
      toast(error?.message || "Could not load audio. Tap play to try again.");
    } finally {
      setStarting(false);
    }
  };

  // Part 1 lights up on any param change, then fades fully dark 1.2s later.
  const [paramLive, setParamLive] = useState(false);
  useEffect(() => {
    if (!paramFlash) return;
    setParamLive(true);
    const timer = setTimeout(() => setParamLive(false), 1200);
    return () => clearTimeout(timer);
  }, [paramFlash]);

  // Tempo changes glow the center BPM readout with the same 1.2s timing.
  const [bpmHot, setBpmHot] = useState(false);
  useEffect(() => {
    if (!bpmFlash) return;
    setBpmHot(true);
    const timer = setTimeout(() => setBpmHot(false), 1200);
    return () => clearTimeout(timer);
  }, [bpmFlash]);

  // Refs mirror the latest state so the running scheduler reads fresh values
  // (edits and BPM changes are picked up mid-playback) without restarting.
  const patternsRef = useRef(patterns);
  const patternNumRef = useRef(patternNum);
  const bpmRef = useRef(bpm);
  const pitchRef = useRef(pitch);
  const swingRef = useRef(swing);
  const bassRef = useRef({ decay: bassDecay, glide: bassGlide });
  useEffect(() => {
    bassRef.current = { decay: bassDecay, glide: bassGlide };
    patternsRef.current = patterns;
    patternNumRef.current = patternNum;
    bpmRef.current = bpm;
    pitchRef.current = pitch;
    swingRef.current = swing;
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

    let nextNoteTime = audioCtx.currentTime;
    let timerID;

    // Schedule every active channel of one pattern for this step; a roll
    // splits the step's span into evenly spaced hits. Returns the loudest
    // kick level sounded, which drives the bezel pulse.
    const scheduleNote = (channels, beatNumber, time, span) => {
      const anySolo = channels.some((c) => c.solo);
      let kick = 0;

      channels.forEach((channel) => {
        const level = channel.steps[beatNumber];
        if (!level) return;
        if (channel.muted || (anySolo && !channel.solo)) return;

        const def = sampleDef(channel);
        const roll = channel.rolls[beatNumber];

        // The 808 row plays its note on the synth voice; a slide applies to
        // the first hit of a roll, the rest restrike.
        if (def.synth) {
          for (let hit = 0; hit < roll; hit++) {
            bass.play(
              time + (hit * span) / roll,
              channel.notes[beatNumber] + pitchRef.current,
              def.gain * VELOCITY_GAIN[level],
              {
                decay: bassRef.current.decay,
                glide: bassRef.current.glide / 1000,
                slide: hit === 0 && channel.slides[beatNumber] === 1,
              }
            );
          }
          return;
        }

        const buffer = buffersRef.current.get(def.sample);
        if (!buffer) return; // still loading
        if (def.id.startsWith("Bass")) kick = Math.max(kick, level);

        for (let hit = 0; hit < roll; hit++) {
          const source = new AudioBufferSourceNode(audioCtx, { buffer });
          // PITCH knob: one semitone doubles the rate every 12 steps.
          source.playbackRate.value = 2 ** (pitchRef.current / 12);
          const gainNode = new GainNode(audioCtx, { gain: def.gain * VELOCITY_GAIN[level] });
          source.connect(gainNode);
          gainNode.connect(fxIn);
          source.start(time + (hit * span) / roll);
        }
      });
      return kick;
    };

    // Kicks flash a glow around the machine, as loud as the hit.
    const glow = document.querySelector(".Machine-glow");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pulse = (level) =>
      glow?.animate([{ opacity: [0, 0.35, 0.6, 1][level] }, { opacity: 0 }], {
        duration: 380,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      });
    let shownFilter;

    // Notes are scheduled up to 0.1s before they sound, so the playhead can't
    // follow the scheduler directly. Each scheduled step goes into a queue and
    // a rAF loop flips currentStep only once the audio clock reaches its time.
    const drawQueue = [];
    let rafID;
    const draw = () => {
      while (drawQueue.length && drawQueue[0].time <= audioCtx.currentTime) {
        const { step, pattern, kick, filter } = drawQueue.shift();
        setCurrentStep(step);
        if (kick && !still) pulse(kick);
        // A song bar lights its pad and turns the FILTER knob as it sounds,
        // unless the song was stopped by a hand edit in the meantime.
        if (pattern !== undefined && songRef.current) showPattern(pattern);
        if (filter !== undefined && songRef.current && filter !== shownFilter) {
          shownFilter = filter;
          setFilter(filter);
          flashParam("FILTER", filterLabel(filter));
        }
      }
      rafID = requestAnimationFrame(draw);
    };
    rafID = requestAnimationFrame(draw);

    const scheduler = () => {
      // While there are notes that will need to play before the next interval,
      // schedule them and advance the pointer. The transport position lives in
      // nextStepRef (Context) and is read fresh every note, so pause keeps the
      // place and a seek from the ruler takes effect within one tick.
      // nextNoteTime stays on the straight grid; swing only delays when an
      // odd step sounds (and lights), so the grid never drifts.
      // While a song plays, it picks the pattern for each bar instead of the
      // pad the user selected, and ramps the filter across bars that sweep.
      while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        const step = nextStepRef.current;
        const song = songRef.current;
        const bar = song ? song.bars[song.pos] : null;
        const pattern = bar ? bar.pad : patternNumRef.current;
        // 16 steps per bar, 4 steps per beat
        const secondsPer16th = 60.0 / bpmRef.current / 4;
        const time = nextNoteTime + swingDelay(step, secondsPer16th, swingRef.current);
        const span = stepLength(step, secondsPer16th, swingRef.current);
        const kick = scheduleNote(patternsRef.current[pattern].channels, step, time, span);
        let filter;
        if (bar?.filter) {
          const [from, to] = bar.filter;
          filter = Math.round(from + ((to - from) * step) / 16);
          if (step === 0) {
            const [start, end] = [filterHz(from), filterHz(to)];
            for (const type of ["lowpass", "highpass"]) {
              const param = filterNodes[type].frequency;
              param.setValueAtTime(start[type], time);
              if (end[type] !== start[type]) {
                param.exponentialRampToValueAtTime(end[type], time + 16 * secondsPer16th);
              }
            }
          }
        }
        drawQueue.push({ step, time, kick, filter, pattern: song ? pattern : undefined });
        nextNoteTime += secondsPer16th;
        nextStepRef.current = (step + 1) % 16;
        if (song && nextStepRef.current === 0) song.pos = nextBar(song, song.pos);
      }
      timerID = setTimeout(scheduler, lookahead);
    };
    scheduler();

    // On pause: stop the clock and the drawing, but leave currentStep lit
    // where it is — the playhead holds its place until resume.
    return () => {
      clearTimeout(timerID);
      cancelAnimationFrame(rafID);
      bass.stop(); // an 808 tail can ring for seconds
    };
    // flashParam is recreated every render but only wraps a stable setter,
    // so it stays out of the deps (listing it would restart the clock).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, audioCtx, fxIn, buffersRef, setCurrentStep, nextStepRef, songRef, showPattern, setFilter, filterNodes, bass]);

  return (
    <div className="Screen">
      <Scope analyser={analyser} running={started} />
      <div className={"Screen-param" + (paramLive ? " is-live" : "")}>
        <div className="Screen-param__name">{paramFlash?.name}</div>
        <div className="Screen-param__value">{paramFlash?.text}</div>
      </div>
      <div className="Screen-main">
        <div className="Screen-main__kit">
          {KITS[currentKit].name} · PATTERN {patternNum + 1}
        </div>
        <div className={"Screen-main__bpm" + (bpmHot ? " is-hot" : "")}>
          {bpm} BPM
        </div>
      </div>
      <div className="Screen-right">
        {started && (
          <div className="Screen-dots">
            {[...Array(16)].map((_, i) => (
              <i key={i} className={i === currentStep ? "is-now" : ""}></i>
            ))}
          </div>
        )}
        <button
          className={"Screen-play" + (started ? " is-playing" : "")}
          onClick={togglePlayback}
          disabled={starting}
          title={starting ? "Loading sounds" : started ? "Pause" : "Play"}
          aria-label={starting ? "Loading sounds" : started ? "Pause" : "Play"}
        >
          <span className="Screen-play__tri"></span>
          <span className="Screen-play__bars"></span>
        </button>
      </div>
    </div>
  );
};
export default Display;
