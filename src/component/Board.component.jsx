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
  KITS,
  CHANNEL_LIMIT,
  newChannel,
  loadKitBuffers,
} from "../service/kits";
import { Context } from "../Context";

const Board = () => {
  const {
    audioCtx,
    patterns,
    setPatterns,
    patternNum,
    currentKit,
    buffersRef,
  } = useContext(Context);

  const channels = patterns[patternNum];

  // Load (fetch + decode) the current kit's samples; cached ones are skipped
  useEffect(() => {
    loadKitBuffers(audioCtx, currentKit, buffersRef.current);
  }, [audioCtx, currentKit, buffersRef]);

  // Rebuild only the current pattern, immutably; other patterns are reused as-is
  const updateChannels = (fn) => {
    setPatterns((prev) =>
      prev.map((pattern, i) => (i === patternNum ? fn(pattern) : pattern))
    );
  };

  const addChannel = () => {
    if (channels.length >= CHANNEL_LIMIT) {
      return;
    }
    // Cycle through the kit's samples so every new row starts with a sound
    const slot = channels.length % KITS[currentKit].channels.length;
    updateChannels((pattern) => [...pattern, newChannel(currentKit, slot)]);
  };

  const deleteChannel = (uid) => {
    updateChannels((pattern) => pattern.filter((c) => c.uid !== uid));
  };

  const toggleStep = (uid, step) => {
    updateChannels((pattern) =>
      pattern.map((c) =>
        c.uid === uid
          ? { ...c, steps: c.steps.map((on, i) => (i === step ? !on : on)) }
          : c
      )
    );
  };

  const toggleFlag = (uid, flag) => {
    updateChannels((pattern) =>
      pattern.map((c) => (c.uid === uid ? { ...c, [flag]: !c[flag] } : c))
    );
  };

  const channelIds = channels.map((c) => c.uid);

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = channelIds.indexOf(active.id);
    const newIndex = channelIds.indexOf(over.id);
    updateChannels((pattern) => arrayMove(pattern, oldIndex, newIndex));
  };

  return (
    <div className="Board">
      <TopBar />
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
                  toggleStep={toggleStep}
                  toggleFlag={toggleFlag}
                  deleteChannel={deleteChannel}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <AddChannel addChannel={addChannel} />
      </div>
    </div>
  );
};
export default Board;
