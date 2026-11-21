import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/app.css";
import "./styles/follow-ups.css";

const root = document.getElementById("root");
if (!root) throw new Error("Der Anwendungsknoten fehlt.");

createRoot(root).render(<App />);
