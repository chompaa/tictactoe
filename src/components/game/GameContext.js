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
    player: PropTypes.object,
    move: PropTypes.string,
    squares: PropTypes.array,
    players: PropTypes.object,
    handleClick: PropTypes.func,
  }).isRequired,
};
