import React, { useState, useContext, createContext, useEffect } from "react";
import {
  useMediaQuery,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fade,
  Zoom
} from "@material-ui/core";
import { PlayArrow, FileCopy } from "@material-ui/icons";
import "./App.css";
import Peer from "peerjs";

const SquareContext = createContext();

const App = () => {
  return (
    <Fade in={true}>
      <div className="App">
        <Board></Board>
      </div>
    </Fade>
  );
};

const Board = () => {
  const symbols = {
    PLAYER_X: "X",
    PLAYER_O: "O"
  };

  const states = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    WINNER: 2,
    DRAW: 3
  };

  const [state, setState] = useState(states.NOT_CONNECTED);
  const [player, setPlayer] = useState({
    peer: new Peer()
  });
  const [squares, setSquares] = useState(Array.from({ length: 9 }));
  const [connId, setConnId] = useState(null);
  const [move, setMove] = useState(symbols.PLAYER_O);
  const [connDialog, setConnDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const mobile = useMediaQuery("(min-width:600px)");
  let idField;

  useEffect(() => {
    player.peer.on("open", id => {
      console.log(`ID ${id}`);
      setPlayer(player => ({
        ...player,
        id: id,
        symbol: symbols.PLAYER_X
      }));
      player.peer.on("connection", conn => {
        setState(states.CONNECTED);
        setConnId(conn.peer);
        setPlayer(player => ({
          ...player,
          conn: conn
        }));

        conn.on("data", data => {
          handleFakeClick(data, symbols.PLAYER_O);
        });
      });
    });
  }, [player.peer, states.CONNECTED, symbols.PLAYER_X, symbols.PLAYER_O]);

  useEffect(() => {
    [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ].forEach(index => {
      if (
        squares[index[0]] &&
        squares[index[0]] === squares[index[1]] &&
        squares[index[0]] === squares[index[2]]
      ) {
        setState(states.WINNER);
        setPlayer(player => ({
          ...player,
          winner: player.symbol === squares[index[0]]
        }));
      }
    });

    if (squares.every(square => square))
      return setState(state => (state === states.WINNER ? state : states.DRAW));

    setMove(move =>
      move === symbols.PLAYER_X ? symbols.PLAYER_O : symbols.PLAYER_X
    );
  }, [squares, states.WINNER, states.DRAW, symbols.PLAYER_X, symbols.PLAYER_O]);

  const handleFakeClick = (index, symbol) => {
    setSquares(prevSquares =>
      prevSquares.map((squareValue, squareIndex) => {
        return squareIndex === index ? symbol : squareValue;
      })
    );
  };

  const handleClick = index => {
    if (move !== player.symbol || squares[index] || state !== states.CONNECTED)
      return;

    handleFakeClick(index, player.symbol);
    player.conn.send(index);
  };

  const connect = () => {
    setConnDialog(false);

    if (player.conn || connId === player.id) return;

    const conn = player.peer.connect(connId);
    conn.on("open", () => {
      setState(states.CONNECTED);
      setPlayer({
        ...player,
        symbol: symbols.PLAYER_O,
        conn: conn
      });

      conn.on("data", data => {
        handleFakeClick(data, symbols.PLAYER_X);
      });
    });
  };

  const renderSquare = (index, border) => {
    let value = squares[index];
    return (
      <SquareContext.Provider
        key={index}
        value={{ handleClick, value, index, border, symbols }}>
        <Square></Square>
      </SquareContext.Provider>
    );
  };

  const calculateBorder = (rowIndex, colIndex) => {
    return rowIndex % 3 === 0
      ? colIndex % 3 === 0
        ? ""
        : "right"
      : colIndex % 3 === 0
      ? "bottom"
      : "bottom right";
  };

  return (
    <React.Fragment>
      <Dialog open={connDialog} onClose={() => setConnDialog(false)}>
        <DialogTitle>Connect to peer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the ID of the user your wish to connect with.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ID"
            fullWidth
            onChange={e => setConnId(e.target.value)}></TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={connect} color="primary">
            Connect
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
        <DialogTitle>Share</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share this ID with anyone you want to connect with.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ID"
            fullWidth
            value={player.id}
            InputProps={{
              readOnly: true
            }}
            onFocus={e => {
              idField = e.target;
              idField.select();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(true)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              idField.select();
              document.execCommand("copy");
              setShareDialog(false);
            }}
            color="primary">
            Copy
          </Button>
        </DialogActions>
      </Dialog>
      <Grid className="grid-container" container direction="column" spacing={5}>
        <Grid item>
          <Grid container justify="center">
            <Typography variant={mobile ? "h2" : "h3"}>
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
                  case states.WINNER:
                    return player.winner ? "You won!" : "You lost..";
                  default:
                    return "Waiting for opponent..";
                }
              })()}
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Paper className="board-paper">
            <table className="board">
              <tbody>
                {Array.from({ length: 3 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 3 }, (_, colIndex) =>
                      renderSquare(
                        rowIndex * 3 + colIndex,
                        calculateBorder(rowIndex + 1, colIndex + 1)
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </Grid>
        <Grid
          className="grid-container"
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={6}>
          <Grid item>
            <Button
              className="button"
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => {
                setConnDialog(true);
              }}>
              Connect
            </Button>
          </Grid>
          <Grid item>
            <Button
              className="button"
              variant="contained"
              color="primary"
              startIcon={<FileCopy />}
              onClick={() => {
                setShareDialog(true);
              }}>
              Share
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const Square = () => {
  const { handleClick, value, index, border, symbols } = useContext(
    SquareContext
  );

  return (
    <td className={border} onClick={() => handleClick(index)}>
      {(() => {
        switch (value) {
          case symbols.PLAYER_X:
            return (
              <Zoom in={true} timeout={500}>
                <svg
                  role="img"
                  viewBox="0 0 128 128"
                  style={{
                    visibility: true,
                    display: "block",
                    margin: "auto"
                  }}>
                  <path
                    d="M28 28 L100 100"
                    style={{
                      stroke: "#673AB7",
                      strokeWidth: 10,
                      strokeDasharray: 135.764,
                      strokeDashoffset: 0
                    }}></path>
                  <path
                    d="M 100 28 L28 100"
                    style={{
                      stroke: "#673AB7",
                      strokeWidth: 10,
                      strokeDasharray: 135.764,
                      strokeDashoffset: 0
                    }}></path>
                </svg>
              </Zoom>
            );
          case symbols.PLAYER_O:
            return (
              <Zoom in={true} timeout={500}>
                <svg
                  role="img"
                  viewBox="0 0 128 128"
                  style={{
                    fillOpacity: 0,
                    visibility: true,
                    display: "block",
                    margin: "auto"
                  }}>
                  <path
                    d="M 64 28 A 36 36, 0, 1, 0, 64, 100 A 36 36, 0, 1, 0, 64, 28"
                    style={{
                      stroke: "#9C27B0",
                      strokeWidth: 10,
                      strokeDasharray: 301.635,
                      strokeDashoffset: 0
                    }}></path>
                </svg>
              </Zoom>
            );
          default:
        }
      })()}
    </td>
  );
};

export default App;
