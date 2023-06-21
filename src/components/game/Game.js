import React, { useState, useEffect, useCallback } from "react";
import { Button, Grid, Backdrop, CircularProgress } from "@mui/material";
import { PlayArrow, FileCopy } from "@mui/icons-material/";
import Peer from "peerjs";
import { GameProvider } from "./GameContext";
import Board from "../Board";
import Status from "../Status";
import { Connect, Share, Rematch, Reject } from "../dialog";

const Game = () => {
  /**
   * Game states
   */
  const states = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    WIN: 2,
    DRAW: 3,
  };

  /**
   * Rematch constants
   */
  const rematchData = {
    REMATCH_ACCEPT: "REMATCH ACCEPT",
    REMATCH_REJECT: "REMATCH REJECT",
    REMATCH_DELAY: 2000,
    REMATCH_TIMEOUT: 9,
  };

  /**
   * State
   */
  const [state, setState] = useState(states.NOT_CONNECTED);
  const [player, setPlayer] = useState({
    peer: new Peer(),
  });
  const [players] = useState({
    PLAYER_X: {
      SYMBOL: "X",
      COLOUR: "#f8a400",
    },
    PLAYER_O: {
      SYMBOL: "O",
      COLOUR: "#99c96f",
    },
  });
  const [squares, setSquares] = useState(Array.from({ length: 9 }));
  const [move, setMove] = useState(players.PLAYER_O.SYMBOL);
  const [connectDialog, setConnectDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [rematchState, setRematchState] = useState({
    rematch: null,
    playerStatus: null,
    opponentStatus: null,
    count: false,
    time: 0,
  });
  const [rematchDialog, setRematchDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [winLine, setWinLine] = useState({
    draw: null,
    style: null,
  });

  /**
   * Handles a game reset
   */
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

  /**
   * Handles the rematch prompt
   */
  const handleRematch = useCallback(() => {
    setRematchDialog(true);
    setRematchState((r) => ({
      ...r,
      count: true,
      time: rematchData.REMATCH_TIMEOUT,
    }));
  }, [rematchData.REMATCH_TIMEOUT]);

  /**
   * Handles win condition
   * @param {Array}   line    Winning line
   * @param {Object}  winner  Winning player object
   */
  const handleWin = useCallback(
    (line, winner) => {
      setState(states.WIN);

      setPlayer((p) => ({
        ...p,
        // check if the player has won
        winner: p.symbol === winner.SYMBOL,
      }));

      let draw;

      // check whether we have a horizontal, vertical or diagonal line
      if (line[1] - line[0] === 1) {
        // horizontal
        draw = `M4,${Math.round((64 / 3) * ((line[0] * 2) / 3 + 1))}
        L124,${Math.round((64 / 3) * ((line[0] * 2) / 3 + 1))}`;
      } else if (line[1] - line[0] === 3) {
        // vertical
        draw = `M${Math.round((64 / 3) * (line[0] * 2 + 1))},
        4L${Math.round((64 / 3) * (line[0] * 2 + 1))},124`;
      } else if (line[0] === 0) {
        // top left to bottom right
        draw = "M4,4L124,124";
      } else {
        // top right to bottom left
        draw = "M124,4L4,124";
      }

      // draw the win line onto the screen
      setWinLine((w) => ({
        ...w,
        draw,
        style: {
          stroke: winner.COLOUR,
          strokeDashoffset: 0,
        },
      }));

      // prompt a rematch after rematch.REMATCH_DELAY ms
      setTimeout(() => handleRematch(), rematchData.REMATCH_DELAY);
    },
    [states.WIN, handleRematch, rematchData.REMATCH_DELAY]
  );

  /**
   * Handles the player accepting a rematch
   */
  const handlePlayerRematchAccept = () => {
    // close the rematch dialog
    setRematchDialog(false);
    // show loading screen
    setLoading(true);

    setRematchState((r) => ({
      ...r,
      playerStatus: true,
    }));

    if (!player || !player.conn) {
      return;
    }

    // let our opponent know we've accepted
    player.conn.send(rematchData.REMATCH_ACCEPT);
  };

  /**
   * Handles the player rejecting a rematch
   */
  const handlePlayerRematchReject = useCallback(() => {
    // close the rematch dialog
    setRematchDialog(false);

    setRematchState((r) => ({
      ...r,
      playerStatus: false,
    }));

    if (!player || !player.conn) {
      return;
    }

    // let our opponent know we've declined
    player.conn.send(rematchData.REMATCH_REJECT);
  }, [player, rematchData.REMATCH_REJECT]);

  /**
   * Handles the opponent accepting a rematch
   */
  const handleOpponentRematchAccept = useCallback(() => {
    setRematchState((r) => ({
      ...r,
      opponentStatus: true,
    }));
  }, []);

  /**
   * Handles the opponent rejecting a rematch
   */
  const handleOpponentRematchReject = useCallback(() => {
    setRematchState((r) => ({
      ...r,
      opponentStatus: false,
    }));

    // playerStatus could be null if the user hasn't pressed yes or no
    if (rematchState.playerStatus !== false) {
      // close the rematch dialog and loading screen if they're open
      setRematchDialog(false);
      setLoading(false);
      // notify the user of the rejection
      setRejectDialog(true);
    }
  }, [rematchState.playerStatus]);

  /**
   * Handles making a move on the board
   * @param  {Integer}  index   Index of the move
   * @param  {String}   symbol  Move symbol
   */
  const handleMove = (index, symbol) => {
    setSquares((s) =>
      s.map(
        // map the square value to symbol if we're at index
        (sValue, sIndex) => (sIndex === index ? symbol : sValue)
      )
    );
  };

  /**
   * Handles a player click on a square
   * @param  {Integer}  index  Index of the square clicked
   */
  const handleClick = (index) => {
    // stop if it's not the player's turn, the square is filled, or we aren't connected
    if (
      move !== player.symbol ||
      squares[index] ||
      state !== states.CONNECTED
    ) {
      return;
    }

    handleMove(index, player.symbol);
    // send the player's move to the opponent
    player.conn.send(index);
  };

  /**
   * Handles data receieved from the opponent if the player is the host
   */
  const handleData = useCallback(
    (data, symbol) => {
      switch (data) {
        case rematchData.REMATCH_ACCEPT:
          handleOpponentRematchAccept();
          break;
        case rematchData.REMATCH_REJECT:
          handleOpponentRematchReject();
          break;
        default:
          handleMove(data, symbol);
      }
    },
    [
      handleOpponentRematchAccept,
      handleOpponentRematchReject,
      rematchData.REMATCH_ACCEPT,
      rematchData.REMATCH_REJECT,
    ]
  );

  /**
   * Handles connecting to a remote peer
   */
  const handleConnect = (id) => {
    // hide the connect dialog
    setConnectDialog(false);

    // stop if we're already connected to a remote peer, or we're trying to
    // connect to ourselves
    if (player.conn || id === player.id) {
      return;
    }

    // connect to the remote peer
    const conn = player.peer.connect(id);
    // called when the connection is established
    conn.on("open", () => {
      setState(states.CONNECTED);
      setPlayer({
        ...player,
        symbol: players.PLAYER_O.SYMBOL,
        conn,
      });

      // called when data is received from the remote peer
      conn.on("data", (data) => {
        handleData(data, players.PLAYER_X.SYMBOL);
      });
    });
  };

  const handleShareDialogClose = () => {
    setShareDialog(false);
  };

  const handleConnectDialogClose = () => {
    setConnectDialog(false);
  };

  /**
   * Sets listeners for peer events on component mount
   */
  useEffect(() => {
    // called when a connection to the PeerServer is established
    player.peer.on("open", (id) => {
      setPlayer((p) => ({
        ...p,
        id,
        symbol: players.PLAYER_X.SYMBOL,
      }));
      // set the user's ID in local storage so it doesn't change when they refresh
      localStorage.setItem("ID", id);
      // called when a new data connection is established from a remote peer
      player.peer.on("connection", (conn) => {
        setState(states.CONNECTED);
        setPlayer((p) => ({
          ...p,
          conn,
        }));

        // called when data is receieved from the remote peer
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

  /**
   * Checks for a win line or draw and updates the current move every time a
   * square has changed
   */
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
        squares[index[0]] &&
        squares[index[0]] === squares[index[1]] &&
        squares[index[0]] === squares[index[2]]
      ) {
        handleWin(
          index,
          squares[index[0]] === players.PLAYER_X.SYMBOL
            ? players.PLAYER_X
            : players.PLAYER_O
        );
      }
    });

    if (squares.every((s) => s)) {
      handleRematch();
      setState((s) => (s === states.WIN ? s : states.DRAW));
      return;
    }

    setMove((m) =>
      m === players.PLAYER_X.SYMBOL
        ? players.PLAYER_O.SYMBOL
        : players.PLAYER_X.SYMBOL
    );
  }, [
    squares,
    states.WIN,
    states.DRAW,
    players.PLAYER_X,
    players.PLAYER_O,
    handleWin,
    handleRematch,
  ]);

  /**
   * Handles the rematch timeout
   */
  useEffect(() => {
    // only countdown if we haven't done anything and our opponent hasn't declined
    if (
      rematchState.playerStatus === null &&
      rematchState.opponentStatus !== false &&
      rematchState.count
    ) {
      // check if the countdown is finished
      if (rematchState.time === 0) {
        handlePlayerRematchReject();
        // otherwise, keep counting down
      } else if (rematchState.time !== 0) {
        setTimeout(
          () =>
            setRematchState((r) => ({
              ...r,
              time: rematchState.time - 1,
            })),
          1000
        );
      }
    }
  }, [
    rematchState.playerStatus,
    rematchState.opponentStatus,
    rematchState.count,
    rematchState.time,
    handlePlayerRematchReject,
  ]);

  /**
   * Checks if both players agreed to a rematch and calls handleGameReset
   */
  useEffect(() => {
    if (rematchState.playerStatus && rematchState.opponentStatus) {
      setLoading(false);
      handleGameReset();
    }
  }, [
    rematchState,
    rematchState.playerStatus,
    rematchState.opponentStatus,
    handleGameReset,
  ]);

  // const classes = useStyles();

  return (
    <>
      <GameProvider
        values={{ connectDialog, handleConnectDialogClose, handleConnect }}
      >
        <Connect />
      </GameProvider>
      <GameProvider values={{ shareDialog, handleShareDialogClose, player }}>
        <Share />
      </GameProvider>
      <GameProvider
        values={{
          rematchDialog,
          rematchState,
          handlePlayerRematchAccept,
          handlePlayerRematchReject,
        }}
      >
        <Rematch />
      </GameProvider>
      <GameProvider values={{ rejectDialog }}>
        <Reject />
      </GameProvider>
      <Backdrop
        sx={{ width: 1, m: 0, zIndex: 10, color: "text.primary" }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 1,
          gap: 5,
          m: 0,
        }}
        container
      >
        <Grid item>
          <Grid
            container
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GameProvider
              values={{
                states,
                state,
                player,
                move,
              }}
            >
              <Status />
            </GameProvider>
          </Grid>
        </Grid>
        <Grid
          container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Grid
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 498,
              height: 498,
              background: "121212",
              margin: 0,
              padding: 0,
            }}
          >
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
            <GameProvider
              values={{
                squares,
                players,
                handleClick,
              }}
            >
              <Board />
            </GameProvider>
          </Grid>
        </Grid>
        <Grid
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            width: 1,
            m: 0,
          }}
          container
        >
          <Grid item>
            <Button
              sx={{ width: 128 }}
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => {
                setConnectDialog(true);
              }}
              disabled={state !== states.NOT_CONNECTED}
            >
              Connect
            </Button>
          </Grid>
          <Grid item>
            <Button
              sx={{ width: 128 }}
              color="primary"
              variant="contained"
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

export default Game;
