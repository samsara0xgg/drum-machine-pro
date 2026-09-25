import React, { useState } from "react";
import "./App.scss";
import Header from "./Header.component";
import ControlPanel from "./ControlPanel.component";
import Display from "./Display.component";
import Pattern from "./Pattern.component";
import Board from "./Board.component";
import Library from "./Library.component";
import Intro, { firstPhase } from "./Intro.component";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// MUI theme still drives the dark menus, select and snackbar
const theme = createTheme({
  typography: {
    fontFamily: '"PT Sans", sans-serif',
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#d1f998",
    },
    background: {
      default: "#121212",
      paper: "#1d1d1d",
    },
  },
});

const App = () => {
  const [intro, setIntro] = useState(firstPhase);
  const machineState = { off: " is-off", boot: " is-booting" }[intro] || "";

  return (
    <ThemeProvider theme={theme}>
      <div className={"Machine" + machineState}>
        <Header onTour={() => setIntro("tour")} />
        <Display />
        <div className="Machine-crow">
          <ControlPanel />
          <div className="Machine-grow"></div>
          <Pattern />
        </div>
        <Board />
        <div className="Machine-glow" aria-hidden="true"></div>
      </div>
      <Library />
      <Intro phase={intro} setPhase={setIntro} />
    </ThemeProvider>
  );
};

export default App;
