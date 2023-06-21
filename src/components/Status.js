import React, { useContext } from "react";
import { Container, Typography } from "@mui/material";
import { GameContext } from "./game/GameContext";
import { ThemeProvider } from "@emotion/react";
import { theme } from "../Theme.js";

const Status = () => {
  const { states, state, player, move } = useContext(GameContext);
  // const classes = useStyles();

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#1e1e1e",
        minWidth: 550,
        px: 3,
        py: 2,
        borderRadius: 3,
      }}
    >
      <ThemeProvider theme={theme}>
        <Typography variant="h6">
          {(() => {
            switch (state) {
              case states.CONNECTED:
                switch (move) {
                  case player.symbol:
                    return "YOUR TURN";
                  default:
                    return "...";
                }
              case states.DRAW:
                return "DRAW!";
              case states.WIN:
                return player.winner ? "YOU WON!" : "YOU LOST..";
              default:
                return "WAITING FOR OPPONENT..";
            }
          })()}
        </Typography>
        {/* <Typography variant="h5">
          {state !== states.NOT_CONNECTED
            ? `playing as ${player.symbol}`
            : "..."}
        </Typography> */}
      </ThemeProvider>
    </Container>
  );
};

export default Status;
