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
import Channel707 from "../service/707";

import { Context } from "../Context";

const Board = (props) => {
  const {
    audioCtx,
    patternNum,
    clipState,
    setClipState,
    setLoadedList,
  } = useContext(Context);
  // Loading the file: fetch the audio file and decode the data
  async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }
  async function setupSample(url) {
    const filePath = url;
    // Here we're waiting for the load of the file
    // To be able to use this keyword we need to be within an `async` function
    const sample = await getFile(audioCtx, filePath);

    return sample;
  }

  useEffect(() => {
    // Load every kit sample once, keeping channel order
    Promise.all(
      Channel707.channels.map((channel) => setupSample(channel.sample))
    ).then((samples) => {
      setLoadedList(samples);
    });
  }, []);

  const deleteChannel = (track) => {
    const changedClipState = clipState.slice();
    changedClipState[patternNum].splice(track, 1);
    setClipState(changedClipState);
  };

  const addChannel = () => {
    // No more channels than the kit has samples
    if (clipState[patternNum].length >= Channel707.channels.length) {
      return;
    }
    const changedClipState = clipState.slice();
    changedClipState[patternNum].push(Array(18).fill(false));

    setClipState(changedClipState);
  };

  const handleClipChange = (track, step) => {
    const changedClipState = clipState.slice();

    changedClipState[patternNum][track][step] =
      !changedClipState[patternNum][track][step];

    setClipState((a) => changedClipState);
  };

  // dnd-kit needs a stable id per sortable row; rows are positional
  const channelIds = clipState[patternNum].map((_, i) => `channel-${i}`);

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = channelIds.indexOf(active.id);
    const newIndex = channelIds.indexOf(over.id);
    const changedClipState = clipState.slice();
    changedClipState[patternNum] = arrayMove(
      changedClipState[patternNum],
      oldIndex,
      newIndex
    );
    setClipState(changedClipState);
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
              {clipState[patternNum].map((elem, index) => (
                <Channel
                  key={`item${index}`}
                  id={`channel-${index}`}
                  track={index}
                  clipState={clipState[patternNum][index]}
                  handleClipChange={handleClipChange}
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
