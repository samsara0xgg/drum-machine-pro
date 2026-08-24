import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KITS } from "../../service/kits";

const Channel = ({
  channel,
  currentStep,
  toggleStep,
  toggleFlag,
  deleteChannel,
  setSample,
}) => {
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
      width="16"
      height="16"
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
        <select
          className="Board-Channel__id"
          value={`${channel.kit}:${channel.slot}`}
          onChange={(e) => {
            const [kit, slot] = e.target.value.split(":");
            setSample(uid, kit, Number(slot));
          }}
        >
          {Object.entries(KITS).map(([kitId, kit]) => (
            <optgroup key={kitId} label={kit.name}>
              {kit.channels.map((def, i) => (
                <option key={def.sample} value={`${kitId}:${i}`}>
                  {def.id}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="Board-Channel__stateicon">
          <input
            checked={muted}
            onChange={() => toggleFlag(uid, "muted")}
            type="checkbox"
            className="Board-Channel__mute"
            title="Mute"
          />
          <input
            checked={solo}
            onChange={() => toggleFlag(uid, "solo")}
            type="checkbox"
            className="Board-Channel__solo"
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
        className={
          "Board-Channel__item" +
          (i === currentStep ? " Board-Channel__item--now" : "")
        }
        onChange={() => toggleStep(uid, i)}
        data-step={i}
      />
    ));
  };

  const createChannelDelete = () => {
    return (
      <span
        className="Board-Channel__delete"
        onClick={() => deleteChannel(uid)}
        title="Delete channel"
      >
        ✕
      </span>
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
