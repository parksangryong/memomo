import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "@fontsource/noto-sans/400.css";
import "@fontsource/noto-sans/400-italic.css";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
root.hasChildNodes() ? hydrateRoot(root, app) : createRoot(root).render(app);
