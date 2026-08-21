import React, { useState, useContext, useEffect } from "react";
import TopBar from "./Board/TopBar.component";
import Channel from "./Board/Channel.component";
import AddChannel from "./Board/AddChannel.component";
import {
  SortableContainer,
  SortableElement,
  arrayMove,
} from "react-sortable-hoc";
import Channel707 from "../service/707";

import { Context } from "../Context";

const Board = (props) => {
  const [, updateState] = useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

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
    // setLastChange([track, step]);
  };

  //Use  react-sortable-hoc to make channels sortable:
  const SortableItem = SortableElement(Channel);

  const ChannelContainer = SortableContainer(() => {
    return (
      <ul>
        {clipState[patternNum].map((elem, index) => (
          <SortableItem
            key={`item${index}`}
            track={index}
            clipState={clipState[patternNum][index]}
            handleClipChange={handleClipChange}
            index={index}
            deleteChannel={deleteChannel}
          />
        ))}
      </ul>
    );
  });

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const changedPattern = arrayMove(clipState[patternNum], oldIndex, newIndex);
    clipState[patternNum] = changedPattern;
    setClipState(clipState);
    forceUpdate();
  };

  return (
    <div className="Board">
      <TopBar />
      <div id="scroll">
        <ChannelContainer onSortEnd={onSortEnd} useDragHandle />
        <AddChannel addChannel={addChannel} />
      </div>
    </div>
  );
};
export default Board;
