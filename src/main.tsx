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
    import("./script/rechner.js"),
    import("./script/dice.js"),
    import("./script/adjustments.js"),
    import("./script/calculations.js"),
    import("./script/inputListeners.js"),
    import("./script/characterInfo.js"),
    import("./script/wallet.js"),
    import("./script/characterAttributes.js"),
    import("./script/hideButtons.js"),
    import("./script/liste.js"),
    import("./script/spezialDice.js"),
    import("./script/shop.js"),
    import("./script/skin.js"),
    import("./script/tabs.js"),
    import("./script/vanillaMagicSystem.js"),
    import("./script/saveLoader.js"),
  ]);
};

void loadLegacyScripts();
