import React, {
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
} from "@material-ui/core";
import { GameContext } from "../game/GameContext";

const Connect = () => {
  const [active, setActive] = useState(false);
  const { connectDialog, handleConnect } = useContext(GameContext);
  const input = useRef();

  useEffect(() => {
    setActive(connectDialog);
  }, [connectDialog]);

  return (
    <Dialog open={active} onClose={() => setActive(false)}>
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
          inputRef={input}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setActive(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleConnect(input.current.value)} color="primary">
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Connect;
