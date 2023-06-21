import "./index.css";
import App from "./App";
import React from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
