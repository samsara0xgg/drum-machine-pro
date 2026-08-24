import { Add, Menu, Save, Update } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Paper,
  styled,
  Toolbar,
} from "@mui/material";
import React, { useContext } from "react";
import Slider from "./Header/Slider.component";
import { Context } from "../Context";

const Header = () => {
  const { bpm, setBpm, volume, setVolume } = useContext(Context);

  const StyledAppBar = styled(AppBar)(({ theme }) => ({
    display: "flex",
  }));

  const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.87)",
    fontSize: "12px",
    marginLeft: "1vw",
    padding: "8px 16px",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#CBFF8B",
    },
  }));

  return (
    <StyledAppBar position="static">
      <Paper elevation={5}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Box sx={{ mr: 1, flexGrow: 1, display: "flex" }}>
            <Slider label="volume" value={volume} onChange={setVolume} />
            <Slider
              label="BPM"
              min="40"
              max="200"
              value={bpm}
              onChange={setBpm}
            />
          </Box>
          <StyledButton sx={{ boxShadow: 3 }} startIcon={<Save />}>
            Save
          </StyledButton>
          <StyledButton sx={{ boxShadow: 3 }} startIcon={<Add />}>
            New
          </StyledButton>
          <StyledButton sx={{ boxShadow: 3 }} startIcon={<Update />}>
            Update
          </StyledButton>
        </Toolbar>
      </Paper>
    </StyledAppBar>
  );
};
export default Header;
