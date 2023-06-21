import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { GameContext } from "../game/GameContext";

export const Rematch = () => {
  const [active, setActive] = useState(false);
  const {
    rematchDialog,
    rematchState,
    handlePlayerRematchAccept,
    handlePlayerRematchReject,
  } = useContext(GameContext);

  useEffect(() => {
    setActive(rematchDialog);
  }, [rematchDialog]);

  return (
    <Dialog open={active} onClose={() => setActive(false)}>
      <DialogTitle>Rematch?</DialogTitle>
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
  );
};
