import { createTheme } from "@mui/material";

export const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: `Assistant`,
    },
  },

  palette: {
    primary: {
      main: "#1e1e1e",
      darker: "#363636",
      contrastText: "#b8b8b8",
    },
    secondary: {
      main: "#b8b8b8",
    },
  },
});
