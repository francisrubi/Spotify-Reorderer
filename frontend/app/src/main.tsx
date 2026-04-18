import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { consumeAuthHash } from "./api";
import "./index.css";

consumeAuthHash();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
