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

const Share = () => {
  const [active, setActive] = useState(false);
  const { shareDialog, player } = useContext(GameContext);
  const input = useRef();

  useEffect(() => {
    setActive(shareDialog);
  }, [shareDialog]);

  return (
    <Dialog open={active} onClose={() => setActive(false)}>
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
          inputRef={input}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setActive(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            input.current.select();
            document.execCommand("copy");
            setActive(false);
          }}
          color="primary"
        >
          Copy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Share;
