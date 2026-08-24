import React from "react";

const AddChannel = (props) => {
  return (
    <div className="Board-AddChannel" onClick={props.addChannel}>
      ADD CHANNEL+
    </div>
  );
};

export default AddChannel;
