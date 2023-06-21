import React from "react";
import { Fade, ThemeProvider } from "@mui/material";
import "./App.css";
import Game from "./components/game/Game";
import { theme } from "./Theme";

const App = () => (
  <Fade in>
    <div className="app">
      <ThemeProvider theme={theme}>
        <Game />
      </ThemeProvider>
    </div>
  </Fade>
);

export default App;
