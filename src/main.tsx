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
    import("./script/rechner.tsx"),
    import("./script/dice.tsx"),
    import("./script/adjustments.tsx"),
    import("./script/calculations.tsx"),
    import("./script/inputListeners.tsx"),
    import("./script/characterInfo.tsx"),
    import("./script/wallet.tsx"),
    import("./script/characterAttributes.tsx"),
    import("./script/hideButtons.tsx"),
    import("./script/liste.tsx"),
    import("./script/spezialDice.tsx"),
    import("./script/shop.tsx"),
    import("./script/skin.tsx"),
    import("./script/tabs.tsx"),
    import("./script/vanillaMagicSystem.tsx"),
    import("./script/saveLoader.tsx"),
  ]);
};

void loadLegacyScripts();
