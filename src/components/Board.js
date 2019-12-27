import React, { useContext } from "react";
import { GameContext, GameProvider } from "./game/GameContext";
import { SquareProvider } from "./square/SquareContext";
import Square from "./square/Square";

/**
 * Renders a square component
 * @param  {Integer}   value        Value of the square in the squares array
 * @param  {Integer}   index        Index of the square
 * @param  {String}    border       Square border type
 * @param  {Object}    players      Players object from the main game
 * @param  {Function}  handleClick  The function fired when a square is clicked
 */
const renderSquare = (value, index, border, players, handleClick) => (
  <GameProvider key={index} values={{ players, handleClick }}>
    <SquareProvider key={index} values={{ value, index, border }}>
      <Square />
    </SquareProvider>
  </GameProvider>
);

/**
 * Calculates which borders a square should have
 * @param   {Integer}  rowIndex  Square row index
 * @param   {Integer}  colIndex  Square column index
 * @return  {String}             Border class name(s)
 */
const calculateBorder = (rowIndex, colIndex) => {
  // check if we're on the third row
  if (rowIndex % 3 === 0) {
    // check if we're on the third column
    if (colIndex % 3 === 0) {
      return "";
    }
    return "right";
  }

  // check if we're on the third column
  if (colIndex % 3 === 0) {
    return "bottom";
  }

  return "bottom right";
};

const Board = () => {
  const { squares, players, handleClick } = useContext(GameContext);

  return (
    <table role="grid" className="board">
      <tbody>
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: 3 }, (_, colIndex) => renderSquare(
              squares[rowIndex * 3 + colIndex],
              rowIndex * 3 + colIndex,
              calculateBorder(rowIndex + 1, colIndex + 1),
              players,
              handleClick,
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Board;
