import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Read the page name from the data-page attribute on the root element
const rootElement = document.getElementById("root");
const page = rootElement?.getAttribute("data-page") || "home";

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <App page={page} />
  </React.StrictMode>,
);
