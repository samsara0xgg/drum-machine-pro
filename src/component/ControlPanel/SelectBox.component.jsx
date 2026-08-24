import React, { useContext } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { KITS } from "../../service/kits";
import { Context } from "../../Context";

export default function SelectBox(props) {
  const { currentKit, switchKit } = useContext(Context);

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="kit-select-label">{props.label}</InputLabel>
        <Select
          labelId="kit-select-label"
          id="kit-select"
          value={currentKit}
          label={props.label}
          onChange={(e) => switchKit(e.target.value)}
        >
          {Object.entries(KITS).map(([kitId, kit]) => (
            <MenuItem key={kitId} value={kitId}>
              {kit.name} · {kit.suggestedBpm} BPM
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
