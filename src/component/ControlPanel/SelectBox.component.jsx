import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectBox(props) {
  const [kit, setKit] = React.useState("707");

  const handleChange = (event) => {
    setKit(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="kit-select-label">{props.label}</InputLabel>
        <Select
          labelId="kit-select-label"
          id="kit-select"
          value={kit}
          label={props.label}
          onChange={handleChange}
        >
          <MenuItem value={"707"}>Roland TR-707</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
