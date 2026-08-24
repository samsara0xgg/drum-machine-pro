import React, { useContext } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { KITS } from "../../service/kits";
import { Context } from "../../Context";

export default function SelectBox() {
  const { currentKit, switchKit } = useContext(Context);

  return (
    <Select
      variant="standard"
      disableUnderline
      sx={{ fontSize: "12.5px" }}
      id="kit-select"
      value={currentKit}
      onChange={(e) => switchKit(e.target.value)}
    >
      {Object.entries(KITS).map(([kitId, kit]) => (
        <MenuItem key={kitId} value={kitId}>
          {kit.name} · {kit.suggestedBpm} BPM
        </MenuItem>
      ))}
    </Select>
  );
}
