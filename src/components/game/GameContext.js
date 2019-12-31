import React, { createContext } from "react";
import { PropTypes } from "prop-types";

export const GameContext = createContext();

export const GameProvider = ({ children, values }) => (
  <GameContext.Provider value={values}>
    {children}
  </GameContext.Provider>
);

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
  values: PropTypes.shape({
    states: PropTypes.object,
    state: PropTypes.number,
    players: PropTypes.object,
    player: PropTypes.object,
    squares: PropTypes.array,
    handleClick: PropTypes.func,
    move: PropTypes.string,
    connectDialog: PropTypes.bool,
    handleConnect: PropTypes.func,
    shareDialog: PropTypes.bool,
    rematchDialog: PropTypes.bool,
    rematchState: PropTypes.object,
    handlePlayerRematchAccept: PropTypes.func,
    handlePlayerRematchReject: PropTypes.func,
    rejectDialog: PropTypes.bool,
  }).isRequired,
};
