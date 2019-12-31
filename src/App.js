import React from "react";
import { Fade } from "@material-ui/core";
import "./App.css";
import Game from "./components/game/Game";

const App = () => (
  <Fade in>
    <div className="App">
      <Game />
    </div>
  </Fade>
);

export default App;
