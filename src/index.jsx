import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./component/App";
import { ContextProvider } from "./Context";
import { StyledEngineProvider } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ContextProvider>
    <App />
    <Analytics />
  </ContextProvider>
);
