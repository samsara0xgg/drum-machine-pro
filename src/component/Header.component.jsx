import { Add, Menu, Save, Update } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  styled,
  Toolbar,
} from "@mui/material";
import React, { useContext, useState } from "react";
import Slider from "./Header/Slider.component";
import { Context } from "../Context";
import { savePattern } from "../service/api";

// Module scope on purpose: defining styled() inside the component would mint a
// new component type every render, making React remount the whole subtree
// (which restarts the Snackbar's transition and auto-hide timer each time).
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

const Header = () => {
  const { bpm, setBpm, volume, setVolume, patterns, patternNum } =
    useContext(Context);
  const [notice, setNotice] = useState(null);

  // Save the whole machine (all 12 patterns; volume is the listener's own
  // business) and hand back a share link — copied to the clipboard, and the
  // address bar becomes the link itself.
  const onSave = async () => {
    try {
      const slug = await savePattern({ version: 1, bpm, patternNum, patterns });
      const url = `${window.location.origin}/p/${slug}`;
      window.history.replaceState(null, "", `/p/${slug}`);
      try {
        await navigator.clipboard.writeText(url);
        setNotice("Share link copied to clipboard");
      } catch {
        setNotice(`Share link: ${url}`);
      }
    } catch {
      setNotice("Save failed — is the server running?");
    }
  };

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
          <StyledButton
            sx={{ boxShadow: 3 }}
            startIcon={<Save />}
            onClick={onSave}
          >
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
      <Snackbar
        open={notice !== null}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        message={notice ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </StyledAppBar>
  );
};
export default Header;
