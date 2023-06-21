import React, { useContext } from "react";
import { Zoom } from "@mui/material";
// import useStyles from "../game/Styles";
import { GameContext } from "../game/GameContext";
import { SquareContext } from "./SquareContext";

const Square = () => {
  const { players, handleClick } = useContext(GameContext);
  const { value, index, border } = useContext(SquareContext);

  // const classes = useStyles();

  return (
    <td role="gridcell" className={border} onClick={() => handleClick(index)}>
      {(() => {
        switch (value) {
          case players.PLAYER_X.SYMBOL:
            return (
              <Zoom in timeout={500}>
                <svg
                  sx={{ width: 1, height: 1 }}
                  role="img"
                  viewBox="0 0 128 128"
                >
                  <path
                    d="M28 28 L100 100"
                    style={{
                      stroke: players.PLAYER_X.COLOUR,
                      strokeWidth: 10,
                    }}
                  />
                  <path
                    d="M 100 28 L28 100"
                    style={{
                      stroke: players.PLAYER_X.COLOUR,
                      strokeWidth: 10,
                    }}
                  />
                </svg>
              </Zoom>
            );
          case players.PLAYER_O.SYMBOL:
            return (
              <Zoom in timeout={500}>
                <svg
                  sx={{ width: 1, height: 1 }}
                  role="img"
                  viewBox="0 0 128 128"
                  style={{
                    fillOpacity: 0,
                    visibility: true,
                  }}
                >
                  <path
                    d="M 64 28 A 36 36, 0, 1, 0, 64, 100 A 36 36, 0, 1, 0, 64, 28"
                    style={{
                      stroke: players.PLAYER_O.COLOUR,
                      strokeWidth: 10,
                    }}
                  />
                </svg>
              </Zoom>
            );
          default:
            return null;
        }
      })()}
    </td>
  );
};

export default Square;
