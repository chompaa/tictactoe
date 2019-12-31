import React, { useContext } from "react";
import { Typography } from "@material-ui/core";
import { GameContext } from "./game/GameContext";
import useStyles from "./game/Styles";

const Status = () => {
  const {
    states, state, player, move,
  } = useContext(GameContext);
  const classes = useStyles();

  return (
    <Typography className={classes.header} variant="h2">
      {(() => {
        switch (state) {
          case states.CONNECTED:
            switch (move) {
              case player.symbol:
                return "It's your turn";
              default:
                return "Their turn..";
            }
          case states.DRAW:
            return "Draw!";
          case states.WIN:
            return player.winner ? "You won!" : "You lost..";
          default:
            return "Waiting for opponent..";
        }
      })()}
    </Typography>
  );
};

export default Status;
