import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/app.css";

const root = document.getElementById("root");
if (!root) throw new Error("Der Anwendungsknoten fehlt.");

createRoot(root).render(<App />);
