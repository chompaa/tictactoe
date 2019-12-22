import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
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
  Zoom,
} from "@material-ui/core";
import { PlayArrow, FileCopy } from "@material-ui/icons";
import "./App.css";
import Peer from "peerjs";

const SquareContext = createContext();

const useStyles = makeStyles((theme) => ({
  header: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "3rem",
    },
  },

  gridContainer: {
    width: "100vw !important",
    margin: "0 !important",
  },

  button: {
    width: "8rem",
  },

  boardContainer: {
    alignItems: "center",
  },

  board: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    width: "31.125rem",
    height: "31.125rem",
    [theme.breakpoints.down("xs")]: {
      width: "17.25rem",
      height: "17.25rem",
    },
  },

  squareSvg: {
    visibility: true,
    display: "block",
    margin: "auto",
    width: "100%",
    height: "100%",
    [theme.breakpoints.down("xs")]: {
      height: "50%",
    },
  },

  backdrop: {
    width: "100vw !important",
    margin: "0 !important",
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const App = () => (
  <Fade in>
    <div className="App">
      <Board />
    </div>
  </Fade>
);


const Board = () => {
  const states = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    WIN: 2,
    DRAW: 3,
  };

  const rematch = {
    REMATCH_ACCEPT: "REMATCH ACCEPT",
    REMATCH_REJECT: "REMATCH REJECT",
    REMATCH_DELAY: 2000,
    REMATCH_TIMEOUT: 10,
  };

  const [state, setState] = useState(states.NOT_CONNECTED);
  const [player, setPlayer] = useState({
    peer: new Peer(),
  });
  const [players] = useState({
    PLAYER_X: {
      SYMBOL: "X",
      COLOUR: "#673AB7",
    },
    PLAYER_O: {
      SYMBOL: "O",
      COLOUR: "#9C27B0",
    },
  });
  const [squares, setSquares] = useState(Array.from({ length: 9 }));
  const [connId, setConnId] = useState(null);
  const [move, setMove] = useState(players.PLAYER_O.SYMBOL);
  const [connDialog, setConnDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [rematchState, setRematchState] = useState({
    rematch: null,
    playerStatus: null,
    opponentStatus: null,
    count: false,
    time: 0,
  });
  const [rematchDialog, setRematchDialog] = useState(false);
  const [rematchBackdrop, setRematchBackdrop] = useState(false);
  const [rematchRejectDialog, setRematchRejectDialog] = useState(false);
  const [winLine, setWinLine] = useState({
    draw: null,
    style: null,
  });

  const shareInput = useRef(null);

  const handleGameReset = useCallback(() => {
    setState(states.CONNECTED);
    setMove(players.PLAYER_O.SYMBOL);
    setSquares(Array.from({ length: 9 }));
    setRematchState({
      rematch: null,
      playerStatus: null,
      opponentStatus: null,
      count: false,
      time: 0,
    });
    setWinLine({
      draw: null,
      style: null,
    });
  }, [states.CONNECTED, players.PLAYER_O.SYMBOL]);

  const handleRematch = useCallback(() => {
    setRematchDialog(true);
    setRematchState((r) => ({
      ...r,
      count: true,
      time: rematch.REMATCH_TIMEOUT,
    }));
  }, [rematch.REMATCH_TIMEOUT]);

  const handleWin = useCallback((line, winner) => {
    setState(states.WIN);

    setPlayer((p) => ({
      ...p,
      winner: p.symbol === winner.SYMBOL,
    }));

    let draw;

    if ((line[1] - line[0]) === 1) {
      // horizontal
      draw = `M4,${Math.round((64 / 3) * (((line[0] * 2) / 3) + 1))}
        L124,${Math.round((64 / 3) * (((line[0] * 2) / 3) + 1))}`;
    } else if ((line[1] - line[0]) === 3) {
      // vertical
      draw = `M${Math.round((64 / 3) * ((line[0] * 2) + 1))},
        4L${Math.round((64 / 3) * ((line[0] * 2) + 1))},124`;
    } else if (line[0] === 0) {
      // top left to bottom right
      draw = "M4,4L124,124";
    } else {
      // top right to bottom left
      draw = "M124,4L4,124";
    }

    setWinLine((w) => ({
      ...w,
      draw,
      style: {
        stroke: winner.COLOUR,
        strokeDashoffset: 0,
      },
    }));

    setTimeout(() => handleRematch(), rematch.REMATCH_DELAY);
  }, [
    states.WIN,
    handleRematch,
    rematch.REMATCH_DELAY,
  ]);

  const handlePlayerRematchAccept = () => {
    setRematchDialog(false);
    setRematchBackdrop(true);

    setRematchState((r) => ({
      ...r,
      playerStatus: true,
    }));

    player.conn.send(rematch.REMATCH_ACCEPT);
  };

  const handlePlayerRematchReject = useCallback(() => {
    setRematchDialog(false);

    setRematchState((r) => ({
      ...r,
      playerStatus: false,
    }));

    player.conn.send(rematch.REMATCH_REJECT);
  }, [player.conn, rematch.REMATCH_REJECT]);

  const handleOpponentRematchAccept = useCallback(() => {
    setRematchState((r) => ({
      ...r,
      opponentStatus: true,
    }));
  }, []);

  const handleOpponentRematchReject = useCallback(() => {
    setRematchState((r) => ({
      ...r,
      opponentStatus: false,
    }));

    // playerStatus could be null if the user has not pressed yes/no
    if (rematchState.playerStatus !== false) {
      setRematchDialog(false);
      setRematchBackdrop(false);
      setRematchRejectDialog(true);
    }
  }, [rematchState.playerStatus]);

  const handleFakeClick = (index, symbol) => {
    setSquares((s) => s.map(
      (squareValue, squareIndex) => (squareIndex === index ? symbol : squareValue),
    ));
  };

  const handleClick = (index) => {
    if (move !== player.symbol || squares[index] || state !== states.CONNECTED) {
      return;
    }

    handleFakeClick(index, player.symbol);
    player.conn.send(index);
  };

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
      rematch.REMATCH_REJECT,
    ],
  );

  useEffect(() => {
    player.peer.on("open", (id) => {
      setPlayer((p) => ({
        ...p,
        id,
        symbol: players.PLAYER_X.SYMBOL,
      }));
      player.peer.on("connection", (conn) => {
        setState(states.CONNECTED);
        setConnId(conn.peer);
        setPlayer((p) => ({
          ...p,
          conn,
        }));

        conn.on("data", (d) => {
          handleData(d, players.PLAYER_O.SYMBOL);
        });
      });
    });
  }, [
    player.peer,
    states.CONNECTED,
    players.PLAYER_X.SYMBOL,
    players.PLAYER_O.SYMBOL,
    handleData,
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
      [2, 4, 6],
    ].forEach((index) => {
      if (
        squares[index[0]]
        && squares[index[0]] === squares[index[1]]
        && squares[index[0]] === squares[index[2]]
      ) {
        handleWin(index, squares[index[0]] === players.PLAYER_X.SYMBOL
          ? players.PLAYER_X
          : players.PLAYER_O);
      }
    });

    if (squares.every((s) => s)) {
      handleRematch();
      setState((s) => (s === states.WIN ? s : states.DRAW));
      return;
    }

    setMove((m) => (m === players.PLAYER_X.SYMBOL
      ? players.PLAYER_O.SYMBOL
      : players.PLAYER_X.SYMBOL
    ));
  }, [
    squares,
    states.WIN,
    states.DRAW,
    players.PLAYER_X,
    players.PLAYER_O,
    handleWin,
    handleRematch,
  ]);

  useEffect(() => {
    if (rematchState.playerStatus === null
      && rematchState.opponentStatus !== false
      && rematchState.count) {
      if (rematchState.time === 0) {
        handlePlayerRematchReject();
      } else if (rematchState.time !== 0) {
        setTimeout(() => setRematchState((r) => ({
          ...r,
          time: rematchState.time - 1,
        })),
        1000);
      }
    }
  }, [
    rematchState.playerStatus,
    rematchState.opponentStatus,
    rematchState.count,
    state,
    states.WIN,
    states.DRAW,
    rematchState.time,
    handlePlayerRematchReject,
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
    handleGameReset,
  ]);

  const connect = () => {
    setConnDialog(false);

    if (player.conn || connId === player.id) return;

    const conn = player.peer.connect(connId);
    conn.on("open", () => {
      setState(states.CONNECTED);
      setPlayer({
        ...player,
        symbol: players.PLAYER_O.SYMBOL,
        conn,
      });

      conn.on("data", (data) => {
        handleData(data, players.PLAYER_X.SYMBOL);
      });
    });
  };

  const renderSquare = (index, border) => {
    const value = squares[index];
    return (
      <SquareContext.Provider
        key={index}
        value={{
          handleClick, value, index, border, players,
        }}
      >
        <Square />
      </SquareContext.Provider>
    );
  };

  const calculateBorder = (rowIndex, colIndex) => {
    if (rowIndex % 3 === 0) {
      if (colIndex % 3 === 0) {
        return "";
      }
      return "right";
    }

    if (colIndex % 3 === 0) {
      return "bottom";
    }

    return "bottom right";
  };

  const classes = useStyles();

  return (
    <>
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
            onChange={(e) => setConnId(e.target.value)}
          />
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
              readOnly: true,
            }}
            inputRef={shareInput}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              shareInput.current.select();
              document.execCommand("copy");
              setShareDialog(false);
            }}
            color="primary"
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={rematchDialog} onClose={() => setRematchDialog(false)}>
        <DialogTitle>Rematch?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to rematch? You have
            {" "}
            {rematchState.time}
            {" "}
            seconds to accept.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handlePlayerRematchAccept();
            }}
            color="primary"
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              handlePlayerRematchReject();
            }}
            color="primary"
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={rematchRejectDialog}
        onClose={() => setRematchRejectDialog(false)}
      >
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
        spacing={5}
      >
        <Grid item>
          <Grid container justify="center">
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
          </Grid>
        </Grid>
        <Grid
          className={classes.boardContainer}
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Paper className={classes.board}>
            <svg
              pointerEvents="none"
              role="img"
              viewBox="0 0 128 128"
              style={{
                visibility: true,
                display: "block",
                position: "absolute",
                margin: "auto",
                width: "inherit",
              }}
            >
              <path
                className="win-line"
                d={winLine.draw}
                style={winLine.style}
              />
            </svg>
            <table role="grid" className="board">
              <tbody>
                {Array.from({ length: 3 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 3 }, (_, colIndex) => renderSquare(
                      rowIndex * 3 + colIndex,
                      calculateBorder(rowIndex + 1, colIndex + 1),
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </Grid>
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={6}
        >
          <Grid item>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => {
                setConnDialog(true);
              }}
              disabled={state !== states.NOT_CONNECTED}
            >
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
              }}
            >
              Share
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const Square = () => {
  const {
    handleClick, value, index, border, players,
  } = useContext(
    SquareContext,
  );

  const classes = useStyles();

  return (
    <td role="gridcell" className={border} onClick={() => handleClick(index)}>
      {(() => {
        switch (value) {
          case players.PLAYER_X.SYMBOL:
            return (
              <Zoom in timeout={500}>
                <svg
                  className={classes.squareSvg}
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
                  className={classes.squareSvg}
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

export default App;
