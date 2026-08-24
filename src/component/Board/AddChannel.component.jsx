import React, { useState } from "react";
import { ListSubheader, Menu, MenuItem } from "@mui/material";
import { KITS } from "../../service/kits";

// Click opens a menu of every kit's sounds (current pattern's kit first);
// picking one adds a row playing that sound
const AddChannel = ({ addChannel, kitId }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const pick = (kit, slot) => {
    addChannel(kit, slot);
    setAnchorEl(null);
  };

  const kitIds = [kitId, ...Object.keys(KITS).filter((k) => k !== kitId)];

  return (
    <>
      <div
        className="Board-AddChannel"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        ADD CHANNEL+
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { style: { maxHeight: 420 } } }}
      >
        {kitIds.flatMap((k) => [
          <ListSubheader key={`header-${k}`}>{KITS[k].name}</ListSubheader>,
          ...KITS[k].channels.map((def, slot) => (
            <MenuItem key={def.sample} onClick={() => pick(k, slot)}>
              {def.id}
            </MenuItem>
          )),
        ])}
      </Menu>
    </>
  );
};

export default AddChannel;
