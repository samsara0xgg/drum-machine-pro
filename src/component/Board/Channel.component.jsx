import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { sampleDef } from "../../service/kits";

const Channel = ({ channel, toggleStep, toggleFlag, deleteChannel }) => {
  const { uid, steps, muted, solo } = channel;

  // dnd-kit: makes this row sortable; listeners go on the drag handle only
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: uid });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Draghandle = () => (
    <svg
      {...attributes}
      {...listeners}
      style={{ touchAction: "none" }}
      className="Board-Channel__dragicon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
    >
      <path
        d="M84.828402 266.60355h848.284024c36.35503 0 60.591716-24.236686 60.591716-60.591716s-24.236686-60.591716-60.591716-60.591716h-848.284024c-36.35503 0-60.591716 24.236686-60.591716 60.591716s24.236686 60.591716 60.591716 60.591716z m848.284024 181.775148h-848.284024c-36.35503 0-60.591716 24.236686-60.591716 60.591716s24.236686 60.591716 60.591716 60.591716h848.284024c36.35503 0 60.591716-24.236686 60.591716-60.591716s-24.236686-60.591716-60.591716-60.591716z m0 302.95858h-848.284024c-36.35503 0-60.591716 24.236686-60.591716 60.591716s24.236686 60.591716 60.591716 60.591716h848.284024c36.35503 0 60.591716-24.236686 60.591716-60.591716s-24.236686-60.591716-60.591716-60.591716z"
        fill="#1a1a1a"
      ></path>
    </svg>
  );

  const createChannelInfo = () => {
    return (
      <div className="Board-Channel__info">
        <Draghandle />
        <div className="Board-Channel__id">{sampleDef(channel).id}</div>
        <span className="Board-Channel__stateicon">
          <input
            checked={muted}
            onChange={() => toggleFlag(uid, "muted")}
            type="checkbox"
            title="Mute"
          />
          <input
            checked={solo}
            onChange={() => toggleFlag(uid, "solo")}
            type="checkbox"
            title="Solo"
          />
        </span>
      </div>
    );
  };

  const createChannelItem = () => {
    return steps.map((on, i) => (
      <input
        key={`clip${i}`}
        checked={on}
        type="checkbox"
        className="Board-Channel__item"
        onChange={() => toggleStep(uid, i)}
        data-step={i}
      />
    ));
  };

  const createChannelDelete = () => {
    return (
      <svg
        onClick={() => deleteChannel(uid)}
        className="Board-Channel__delete"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
      >
        <path
          d="M989.431954 201.728L679.159954 512l310.272 310.272a118.198857 118.198857 0 0 1-167.058285 167.131429L512.028526 679.058286l-310.345143 310.345143A117.76 117.76 0 0 1 118.15424 1024a118.198857 118.198857 0 0 1-83.529143-201.728L344.897097 512 34.625097 201.728A118.125714 118.125714 0 0 1 201.683383 34.596571L512.028526 344.868571 822.300526 34.596571a118.198857 118.198857 0 0 1 167.131428 167.131429z"
          fill="#707070"
        ></path>
      </svg>
    );
  };

  return (
    <li ref={setNodeRef} style={sortableStyle}>
      <div className="Board-Channel">
        {createChannelInfo()}
        <div className="Board-Channel__group">{createChannelItem()}</div>
        {createChannelDelete()}
      </div>
    </li>
  );
};
export default Channel;
