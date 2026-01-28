import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style/main.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const loadLegacyScripts = async () => {
  await Promise.all([
    import("./features/character/legacy"),
    import("./features/shop/legacy"),
    import("./features/dice/legacy"),
  ]);
};

void loadLegacyScripts();
