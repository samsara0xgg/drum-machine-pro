import React, { useContext, useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import TopBar from "./Board/TopBar.component";
import Channel from "./Board/Channel.component";
import AddChannel from "./Board/AddChannel.component";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  CHANNEL_LIMIT,
  fitVoice,
  isSynth,
  newChannel,
  loadKitBuffers,
  loadSample,
  sampleDef,
} from "../service/kits";
import { Context } from "../Context";
import { pageForStep, stepsForPage } from "../service/mobile";
import { paint } from "../service/groove";
import { DEFAULT_NOTE } from "../service/bass808";
import BassPanel from "./Board/BassPanel.component";

// One brush row: the value new pads are painted with.
const Brush = ({ label, options, value, onChange }) => (
  <div className="Board-Brush" role="group" aria-label={label}>
    <span className="Board-Brush__label">{label}</span>
    {options.map(([v, text]) => (
      <button
        key={v}
        className={"Board-Brush__button" + (v === value ? " is-active" : "")}
        data-kind={label}
        data-value={v}
        aria-pressed={v === value}
        onClick={() => onChange(v)}
      >
        {text}
      </button>
    ))}
  </div>
);

const Board = () => {
  const {
    audioCtx,
    patterns,
    setPatterns,
    patternNum,
    currentKit,
    currentStep,
    seekTo,
    buffersRef,
    started,
  } = useContext(Context);

  const isMobile = useMediaQuery("(max-width:600px)");
  // Brushes: clicked pads are drawn at this level (1 soft, 2 mid, 3 hard)
  // and roll (hits per step, 1-4).
  const [brush, setBrush] = useState(2);
  const [rollBrush, setRollBrush] = useState(1);
  // 808 rows also paint a note, and whether the note slides in.
  const [noteBrush, setNoteBrush] = useState(DEFAULT_NOTE);
  const [slideBrush, setSlideBrush] = useState(0);
  const [mobilePage, setMobilePage] = useState(0);

  // Follow the sounding group just four times per bar, not on every step.
  useEffect(() => {
    if (isMobile && started && currentStep >= 0) {
      setMobilePage(pageForStep(currentStep));
    }
  }, [isMobile, started, currentStep]);

  const visibleSteps = isMobile
    ? stepsForPage(mobilePage)
    : Array.from({ length: 16 }, (_, index) => index);

  const channels = patterns[patternNum].channels;

  // Preload the current pattern's kit so its palette responds instantly
  useEffect(() => {
    loadKitBuffers(audioCtx, currentKit, buffersRef.current);
  }, [audioCtx, currentKit, buffersRef]);

  // Whatever samples the rows reference (cross-kit picks included) get loaded
  useEffect(() => {
    channels.forEach((channel) =>
      loadSample(audioCtx, sampleDef(channel).sample, buffersRef.current)
    );
  }, [channels, audioCtx, buffersRef]);

  // Rebuild only the current pattern's rows, immutably; everything else is reused
  const updateChannels = (fn) => {
    setPatterns((prev) =>
      prev.map((pattern, i) =>
        i === patternNum ? { ...pattern, channels: fn(pattern.channels) } : pattern
      )
    );
  };

  // kit + slot are picked by the user from the AddChannel menu
  const addChannel = (kit, slot) => {
    if (channels.length >= CHANNEL_LIMIT) {
      return;
    }
    updateChannels((rows) => [...rows, newChannel(kit, slot)]);
  };

  const setChannelSample = (uid, kit, slot) => {
    updateChannels((rows) =>
      rows.map((c) => (c.uid === uid ? fitVoice({ ...c, kit, slot }) : c))
    );
  };

  const deleteChannel = (uid) => {
    updateChannels((rows) => rows.filter((c) => c.uid !== uid));
  };

  const paintStep = (uid, step) => {
    updateChannels((rows) =>
      rows.map((c) => {
        if (c.uid !== uid) return c;
        const synth = isSynth(c);
        const next = paint(
          {
            level: c.steps[step],
            roll: c.rolls[step],
            ...(synth && { note: c.notes[step], slide: c.slides[step] }),
          },
          {
            level: brush,
            roll: rollBrush,
            ...(synth && { note: noteBrush, slide: slideBrush }),
          }
        );
        const set = (list, value) => list.map((v, i) => (i === step ? value : v));
        return {
          ...c,
          steps: set(c.steps, next.level),
          rolls: set(c.rolls, next.roll),
          ...(synth && { notes: set(c.notes, next.note), slides: set(c.slides, next.slide) }),
        };
      })
    );
  };

  const toggleFlag = (uid, flag) => {
    updateChannels((rows) =>
      rows.map((c) => (c.uid === uid ? { ...c, [flag]: !c[flag] } : c))
    );
  };

  const channelIds = channels.map((c) => c.uid);

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = channelIds.indexOf(active.id);
    const newIndex = channelIds.indexOf(over.id);
    updateChannels((rows) => arrayMove(rows, oldIndex, newIndex));
  };

  return (
    <div className="Board">
      <div className="Board-pager" aria-label="Step groups">
        {[0, 1, 2, 3].map((page) => (
          <button
            key={page}
            className={"Board-pager__button" + (page === mobilePage ? " is-active" : "")}
            aria-pressed={page === mobilePage}
            onClick={() => setMobilePage(page)}
          >
            {page * 4 + 1}–{page * 4 + 4}
          </button>
        ))}
      </div>
      <div className="Board-tools">
        <Brush
          label="HIT"
          options={[[1, "SOFT"], [2, "MID"], [3, "HARD"]]}
          value={brush}
          onChange={setBrush}
        />
        <Brush
          label="ROLL"
          options={[[1, "1"], [2, "2"], [3, "3"], [4, "4"]]}
          value={rollBrush}
          onChange={setRollBrush}
        />
      </div>
      {channels.some(isSynth) && (
        <BassPanel
          note={noteBrush}
          setNote={setNoteBrush}
          slide={slideBrush}
          setSlide={setSlideBrush}
        />
      )}
      <div id="scroll">
        <TopBar currentStep={currentStep} seekTo={seekTo} stepIndices={visibleSteps} />
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={channelIds}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {channels.map((channel) => (
                <Channel
                  key={channel.uid}
                  channel={channel}
                  currentStep={currentStep}
                  paintStep={paintStep}
                  toggleFlag={toggleFlag}
                  deleteChannel={deleteChannel}
                  setSample={setChannelSample}
                  stepIndices={visibleSteps}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <AddChannel addChannel={addChannel} kitId={currentKit} />
      </div>
    </div>
  );
};
export default Board;
