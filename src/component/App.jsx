import React from "react";
import "./App.scss";
import Header from "./Header.component";
import ControlPanel from "./ControlPanel.component";
import Display from "./Display.component";
import Pattern from "./Pattern.component";
import Board from "./Board.component";
import Library from "./Library.component";
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
  return (
    <ThemeProvider theme={theme}>
      <div className="Machine">
        <Header />
        <Display />
        <div className="Machine-crow">
          <ControlPanel />
          <div className="Machine-grow"></div>
          <Pattern />
        </div>
        <Board />
      </div>
      <Library />
    </ThemeProvider>
  );
};

export default App;
