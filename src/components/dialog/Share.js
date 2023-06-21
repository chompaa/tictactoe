import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  ThemeProvider,
} from "@mui/material";
import { GameContext } from "../game/GameContext";
import { theme } from "../../Theme";

export const Share = () => {
  const { shareDialog, handleShareDialogClose, player } =
    useContext(GameContext);
  const [id, setId] = useState("");
  const input = useRef();

  useEffect(() => {
    setId(player.id);
  }, [player]);

  return (
    <Dialog open={shareDialog} onClose={() => handleShareDialogClose()}>
      <ThemeProvider theme={theme}>
        <DialogTitle>Share</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Share this ID with anyone you want to connect with.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ID"
            fullWidth
            value={id}
            onChange={(e) => setId(e.target.value)}
            InputProps={{
              readOnly: true,
            }}
            inputRef={input}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleShareDialogClose()} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              input.current.select();
              document.execCommand("copy");
              handleShareDialogClose();
            }}
            color="primary"
          >
            Copy
          </Button>
        </DialogActions>
      </ThemeProvider>
    </Dialog>
  );
};
