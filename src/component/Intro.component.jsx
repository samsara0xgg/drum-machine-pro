import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Context } from "../Context";
import { DEMO_SONG } from "../service/presets";
import { loadSample, sampleDef } from "../service/kits";
import { ensureAudioReady } from "../service/audio";

// First visit: power screen -> boot animation writes the demo song's intro
// onto the pads -> the song plays through pads 1-5 -> a tour explains each module.
// Phases: off -> boot -> demo -> tour -> done ("?" in the header reopens the tour).
const SEEN_KEY = "drum-machine-intro-seen";
// Matches the boot timeline in App.scss: the last pad lands at 700 + 15 * 60 + 260 ms.
const BOOT_MS = 1900;
// Let the demo's two intro bars play out before the tour dims the machine.
const INTRO_MS = 2 * (60 / DEMO_SONG.payload.bpm) * 4 * 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Share links skip the intro: the visitor came for someone else's beat.
export const firstPhase = () => {
  if (window.location.pathname.startsWith("/p/")) return "done";
  try {
    return localStorage.getItem(SEEN_KEY) ? "done" : "off";
  } catch {
    return "off";
  }
};

const STEPS = [
  {
    title: "Drum Machine Pro",
    text: "A 16-step drum machine in your browser: draw a beat on the pads, pick a classic kit, shape it with FX. Here's what each part of the machine does.",
  },
  {
    target: ".Screen",
    title: "Display",
    text: "Shows the kit, pattern and tempo, and flashes the value of whatever you just turned. The button on the right plays and pauses.",
  },
  {
    target: ".Board",
    place: "above",
    title: "Sequencer",
    text: "The heart of the machine. Each row is one drum, each column a 16th note. Lit pads play. The brushes above set how new pads play: HIT soft, mid or hard; ROLL fires a pad 2 to 4 times in its step (a sliced pad), for trap hat rolls. Per row: click the name to change the sound, the dots mute (green) or solo (red).",
    mobileText: "The heart of the machine. Each row is one drum, each column a 16th note. Lit pads play. The brushes above it set how new pads play: HIT picks soft, mid or hard, ROLL fires a pad 2 to 4 times within its step. Tapping a pad that already matches both clears it. The buttons above show the 16 steps four at a time.",
  },
  {
    target: ".Machine-card--master",
    title: "Master",
    text: "TEMPO sets the speed in BPM, VOL the overall level. SWING pushes every second 16th late for a laid-back groove: 50% is straight, hip hop often sits at 55-60%. Drag a knob up or right to turn it; double-click to reset.",
    mobileText: "TEMPO sets the speed in BPM, VOL the overall level. SWING pushes every second 16th late for a laid-back groove: 50% is straight, hip hop often sits at 55-60%.",
  },
  {
    target: ".Machine-card--fx",
    title: "FX",
    text: "Effects on the whole mix: PITCH tunes every sound up or down in semitones, PAN moves it left or right, REVERB puts it in a room. FILTER turned left muffles the mix, turned right thins it out: the demo's intro and build-up are this knob moving.",
  },
  {
    target: ".Machine-card--instrument",
    title: "Instrument",
    text: "Five classic drum machines: TR-707, TR-808, LinnDrum, Rhythm Ace and a hip hop kit. Switching keeps your beat and swaps the sounds.",
  },
  {
    target: ".Machine-card--pattern",
    title: "Patterns",
    text: "12 pattern slots, each with its own beat and kit. The demo is a song across pads 1 to 6: intro, groove, two build-up bars, chorus and its fill. Click a pad (or edit the grid) and the song stays on that section.",
  },
  {
    target: ".Header",
    title: "Library",
    text: "☰ opens the Library: preset grooves, your saved patterns and share links. SAVE stores the whole machine, NEW starts blank, UPDATE overwrites the pattern you loaded, ? replays this tour.",
    mobileText: "☰ opens the Library: preset grooves, your saved patterns and share links. SAVE stores the whole machine.",
  },
];

const PAD = 8; // spotlight margin around the module
const GAP = 12; // spotlight to card

// Dims the page except one module, with a card explaining it. Both are
// absolutely positioned in page coordinates, so scrolling never moves them.
const Tour = ({ onClose }) => {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const mobile = useMediaQuery("(max-width:600px)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const spotRef = useRef(null);
  const cardRef = useRef(null);
  const nextRef = useRef(null);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const close = () => {
    setLeaving(true);
    setTimeout(onClose, 200);
  };
  const next = () => (last ? close() : setIndex(index + 1));
  const back = () => setIndex(Math.max(0, index - 1));

  useLayoutEffect(() => {
    const spot = spotRef.current;
    const card = cardRef.current;
    const place = () => {
      const x = window.scrollX;
      const y = window.scrollY;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;
      const el = step.target && document.querySelector(step.target);
      // No module (the welcome card): a tiny ringless spotlight dims everything
      // (a 0x0 box would paint no shadow at all).
      const r = el
        ? el.getBoundingClientRect()
        : { left: vw / 2, top: vh / 2, width: 2, height: 2 };
      const pad = el ? PAD : 0;
      const box = {
        left: r.left + x - pad,
        top: r.top + y - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      };
      spot.style.transform = `translate(${box.left}px, ${box.top}px)`;
      spot.style.width = `${box.width}px`;
      spot.style.height = `${box.height}px`;

      const left = Math.min(Math.max(16, r.left + r.width / 2 - cw / 2), vw - 16 - cw) + x;
      const top = !el
        ? y + (vh - ch) / 2
        : step.place === "above"
        ? box.top - GAP - ch
        : box.top + box.height + GAP;
      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      return { top: Math.min(box.top, top), bottom: Math.max(box.top + box.height, top + ch) };
    };

    // Bring the module and its card into view together.
    const { top, bottom } = place();
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (top - 16 < y || bottom + 16 > y + vh) {
      const span = bottom - top;
      window.scrollTo({
        top: span + 32 > vh ? top - 16 : top - (vh - span) / 2,
        behavior: reduce ? "auto" : "smooth",
      });
    }
    nextRef.current.focus({ preventScroll: true });

    // ponytail: re-places on window resize only; a module that changes size
    // on its own mid-step (e.g. a row added) leaves the spotlight stale until Next.
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [index, mobile, reduce, step]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") back();
  };

  return (
    <div className={"Tour" + (leaving ? " is-leaving" : "")} onKeyDown={onKeyDown}>
      <div ref={spotRef} className={"Tour-spot" + (step.target ? "" : " is-empty")}></div>
      <div
        key={index}
        ref={cardRef}
        className="Tour-card"
        role="dialog"
        aria-label={step.title}
      >
        <div className="Tour-card__head">
          <span className="Tour-card__title">{step.title}</span>
          <span className="Tour-card__count">
            {index + 1} / {STEPS.length}
          </span>
        </div>
        <p className="Tour-card__text">{(mobile && step.mobileText) || step.text}</p>
        <div className="Tour-card__buttons">
          {!last && (
            <button className="Tour-card__skip" onClick={close}>
              Skip tour
            </button>
          )}
          {index > 0 && (
            <button className="Header-button" onClick={back}>
              BACK
            </button>
          )}
          <button ref={nextRef} className="Header-button Tour-card__next" onClick={next}>
            {last ? "START JAMMING" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Intro = ({ phase, setPhase }) => {
  const { audioCtx, buffersRef, hydrate, songRef, setStarted, toast } = useContext(Context);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };

  const powerOn = async () => {
    // resume() must start inside the click itself (iOS), before any await.
    const audio = ensureAudioReady(audioCtx);
    markSeen();
    hydrate(DEMO_SONG.payload);
    songRef.current = { bars: DEMO_SONG.bars, loopFrom: DEMO_SONG.loopFrom, pos: 0 };
    setPhase("boot");
    const urls = new Set(
      DEMO_SONG.payload.patterns.flatMap((p) => p.channels.map((c) => sampleDef(c).sample))
    );
    const samples = Promise.all(
      [...urls].map((url) => loadSample(audioCtx, url, buffersRef.current))
    );
    try {
      await Promise.all([audio, samples, wait(reduce ? 300 : BOOT_MS)]);
      setStarted(true);
    } catch (error) {
      toast(error?.message || "Could not load audio. Tap play to try again.");
    }
    setPhase("demo");
    await wait(INTRO_MS);
    setPhase("tour");
  };

  const skip = () => {
    markSeen();
    setPhase("done");
  };

  if (phase === "tour") return <Tour onClose={() => setPhase("done")} />;
  if (phase !== "off" && phase !== "boot") return null;

  return (
    <div className={"Power" + (phase === "boot" ? " is-leaving" : "")}>
      <div className="Power__brand">DRUM MACHINE PRO</div>
      <button className="Power__button" onClick={powerOn} autoFocus aria-label="Power on">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 3v8" />
          <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
        </svg>
      </button>
      <div className="Power__label">POWER ON</div>
      <div className="Power__hint">Plays a short 808 trap beat · sound on</div>
      <button className="Power__skip" onClick={skip}>
        Skip intro
      </button>
    </div>
  );
};

export default Intro;
