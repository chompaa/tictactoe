import React, { createContext } from "react";
import { PropTypes } from "prop-types";

export const SquareContext = createContext();

export const SquareProvider = ({ children, values }) => (
  <SquareContext.Provider value={values}>
    {children}
  </SquareContext.Provider>
);

SquareProvider.propTypes = {
  children: PropTypes.node.isRequired,
  values: PropTypes.shape({
    value: PropTypes.string,
    index: PropTypes.number,
    border: PropTypes.string,
  }).isRequired,
};
