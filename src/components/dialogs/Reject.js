import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";
import { GameContext } from "../game/GameContext";

const Rematch = () => {
  const [active, setActive] = useState(false);
  const { rejectDialog } = useContext(GameContext);

  useEffect(() => {
    setActive(rejectDialog);
  }, [rejectDialog]);

  return (
    <Dialog
      open={active}
      onClose={() => setActive(false)}
    >
      <DialogContent>
        <DialogContentText>
          Your opponent rejected the rematch.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setActive(false)} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Rematch;
