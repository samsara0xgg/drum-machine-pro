import React, { useContext, useEffect } from "react";
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
  newChannel,
  loadKitBuffers,
  loadSample,
  sampleDef,
} from "../service/kits";
import { Context } from "../Context";

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
  } = useContext(Context);

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
      rows.map((c) => (c.uid === uid ? { ...c, kit, slot } : c))
    );
  };

  const deleteChannel = (uid) => {
    updateChannels((rows) => rows.filter((c) => c.uid !== uid));
  };

  const toggleStep = (uid, step) => {
    updateChannels((rows) =>
      rows.map((c) =>
        c.uid === uid
          ? { ...c, steps: c.steps.map((on, i) => (i === step ? !on : on)) }
          : c
      )
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
      <TopBar currentStep={currentStep} seekTo={seekTo} />
      <div id="scroll">
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
                  toggleStep={toggleStep}
                  toggleFlag={toggleFlag}
                  deleteChannel={deleteChannel}
                  setSample={setChannelSample}
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
