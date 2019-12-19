import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useCallback
} from "react";
import { makeStyles } from "@material-ui/core/styles";
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
  Backdrop,
  CircularProgress,
  Fade,
  Zoom
} from "@material-ui/core";
import { PlayArrow, FileCopy, CallMissedSharp } from "@material-ui/icons";
import "./App.css";
import Peer from "peerjs";

const SquareContext = createContext();

const useStyles = makeStyles(theme => ({
  gridContainer: {
    width: "100vw !important",
    margin: "0 !important"
  },

  button: {
    width: "8rem"
  },

  board: {
    display: "inline-block",
    padding: theme.spacing(2)
  },

  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff"
  }
}));

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
    WIN: 2,
    DRAW: 3
  };

  const rematch = {
    REMATCH_ACCEPT: "REMATCH ACCEPT",
    REMATCH_REJECT: "REMATCH REJECT",
    REMATCH_TIME: 10
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

  const [rematchState, setRematchState] = useState({
    rematch: null,
    playerStatus: null,
    opponentStatus: null,
    time: 0
  });
  const [rematchDialog, setRematchDialog] = useState(false);
  const [rematchBackdrop, setRematchBackdrop] = useState(false);
  const [rematchRejectDialog, setRematchRejectDialog] = useState(false);

  const mobile = useMediaQuery("(min-width:600px)");
  let idField;

  const handleGameReset = useCallback(() => {
    setState(states.CONNECTED);
    setMove(symbols.PLAYER_O);
    setSquares(Array.from({ length: 9 }));
    setRematchState({
      rematch: null,
      playerStatus: null,
      opponentStatus: null
    });
  }, [states.CONNECTED, symbols.PLAYER_O]);

  const handleRematch = useCallback(() => {
    setRematchDialog(true);
    setRematchState(rematchState => ({
      ...rematchState,
      time: rematch.REMATCH_TIME
    }));
  }, [rematch.REMATCH_TIME]);

  const handlePlayerRematchAccept = () => {
    setRematchDialog(false);
    setRematchBackdrop(true);

    setRematchState(rematchState => ({
      ...rematchState,
      playerStatus: true
    }));

    player.conn.send(rematch.REMATCH_ACCEPT);
  };

  const handlePlayerRematchReject = useCallback(() => {
    setRematchDialog(false);

    setRematchState(rematchState => ({
      ...rematchState,
      playerStatus: false
    }));

    player.conn.send(rematch.REMATCH_REJECT);
  }, [player.conn, rematch.REMATCH_REJECT]);

  const handleOpponentRematchAccept = useCallback(() => {
    setRematchState(rematchState => ({
      ...rematchState,
      opponentStatus: true
    }));
  }, []);

  const handleOpponentRematchReject = useCallback(() => {
    setRematchState(rematchState => ({
      ...rematchState,
      opponentStatus: false
    }));

    // playerStatus could be null if the user has not pressed yes/no
    if (rematchState.playerStatus !== false) {
      setRematchDialog(false);
      setRematchBackdrop(false);
      setRematchRejectDialog(true);
    }
  }, [rematchState.playerStatus]);

  const handleData = useCallback(
    (data, symbol) => {
      switch (data) {
        case rematch.REMATCH_ACCEPT:
          handleOpponentRematchAccept();
          break;
        case rematch.REMATCH_REJECT:
          handleOpponentRematchReject();
          break;
        default:
          handleFakeClick(data, symbol);
      }
    },
    [
      handleOpponentRematchAccept,
      handleOpponentRematchReject,
      rematch.REMATCH_ACCEPT,
      rematch.REMATCH_REJECT
    ]
  );

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
          handleData(data, symbols.PLAYER_O);
        });
      });
    });
  }, [
    player.peer,
    states.CONNECTED,
    symbols.PLAYER_X,
    symbols.PLAYER_O,
    handleData
  ]);

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
        setState(states.WIN);
        setPlayer(player => ({
          ...player,
          winner: player.symbol === squares[index[0]]
        }));
        handleRematch();
      }
    });

    if (squares.every(square => square)) {
      handleRematch();
      return setState(state => (state === states.WIN ? state : states.DRAW));
    }

    setMove(move =>
      move === symbols.PLAYER_X ? symbols.PLAYER_O : symbols.PLAYER_X
    );
  }, [
    squares,
    states.WIN,
    states.DRAW,
    symbols.PLAYER_X,
    symbols.PLAYER_O,
    handleRematch
  ]);

  useEffect(() => {
    if (!rematchState.playerState) {
      if (
        (state === states.WIN || state === states.DRAW) &&
        rematchState.time === 0
      ) {
        handlePlayerRematchReject();
      } else if (rematchState.time !== 0) {
        setTimeout(
          () =>
            setRematchState(rematchState => ({
              ...rematchState,
              time: rematchState.time - 1
            })),
          1000
        );
      }
    }
  }, [
    rematchState.playerState,
    state,
    states.WIN,
    states.DRAW,
    rematchState.time,
    handlePlayerRematchReject
  ]);

  useEffect(() => {
    if (rematchState.playerStatus && rematchState.opponentStatus) {
      setRematchBackdrop(false);
      handleGameReset();
    }
  }, [
    rematchState,
    rematchState.playerStatus,
    rematchState.opponentStatus,
    handleGameReset
  ]);

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
        handleData(data, symbols.PLAYER_X);
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

  const classes = useStyles();

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
          <Button onClick={() => setShareDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              document.execCommand("copy");
              setShareDialog(false);
            }}
            color="primary">
            Copy
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={rematchDialog} onClose={() => setRematchDialog(false)}>
        <DialogTitle>{"Rematch?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to rematch? You have {rematchState.time} seconds to
            accept.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handlePlayerRematchAccept();
            }}
            color="primary">
            Yes
          </Button>
          <Button
            onClick={() => {
              handlePlayerRematchReject();
            }}
            color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={rematchRejectDialog}
        onClose={() => setRematchRejectDialog(false)}>
        <DialogContent>
          <DialogContentText>
            Your opponent rejected the rematch.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRematchRejectDialog(false)} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={rematchBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid
        className={classes.gridContainer}
        container
        direction="column"
        spacing={5}>
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
                  case states.WIN:
                    return player.winner ? "You won!" : "You lost..";
                  default:
                    return "Waiting for opponent..";
                }
              })()}
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Paper className={classes.board}>
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
              className={classes.button}
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => {
                setConnDialog(true);
              }}
              disabled={state !== states.NOT_CONNECTED}>
              Connect
            </Button>
          </Grid>
          <Grid item>
            <Button
              className={classes.button}
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
