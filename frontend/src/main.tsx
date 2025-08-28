import * as React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import LayoutWrapper from "./components/LayoutWrapper";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LayoutWrapper>
        <App />
      </LayoutWrapper>
    </BrowserRouter>
  </React.StrictMode>
);