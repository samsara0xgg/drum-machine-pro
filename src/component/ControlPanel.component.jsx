import { Box, Card, Container, Grid, styled } from "@mui/material";
import React, { useContext } from "react";
import Knob from "./ControlPanel/Knob.component";
import SelectBox from "./ControlPanel/SelectBox.component";
import { Context } from "../Context";

const KnobContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const ControlPanel = () => {
  const { pitch, setPitch, volume, setVolume, pan, setPan, reverb, setReverb } =
    useContext(Context);

  // Each knob drives one master control; VOL shares state with the header slider.
  const knobs = [
    { name: "PITCH", min: -24, max: 24, step: 1, defaultValue: 0, value: pitch, onChange: setPitch },
    { name: "VOL", min: 0, max: 100, step: 1, defaultValue: 80, value: volume, onChange: setVolume },
    { name: "PAN", min: -1, max: 1, step: 0.1, defaultValue: 0, value: pan, onChange: setPan },
    { name: "REVERB", min: 0, max: 1, step: 0.01, defaultValue: 0, value: reverb, onChange: setReverb },
  ];

  return (
    <Card elevation={5} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box>
            <SelectBox label={"instrument"} />
          </Box>
        </Grid>
        {knobs.map((knob) => (
          <Grid key={knob.name} item xs={6}>
            <KnobContainer>
              <Knob {...knob} />
            </KnobContainer>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
};
export default ControlPanel;
