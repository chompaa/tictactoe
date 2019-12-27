import { makeStyles } from "@material-ui/core/styles";

/**
  * Styling for Material-UI components and SVG's
  */
const useStyles = makeStyles((theme) => ({
  header: {
    // mobile check
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
    // mobile check
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
    // mobile check
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

export default useStyles;
