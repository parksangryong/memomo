import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "@fontsource/noto-sans/400.css";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
const requestedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const prerenderedPath = root.dataset.prerenderPath;
if (root.hasChildNodes() && prerenderedPath === requestedPath) hydrateRoot(root, app);
else {
  // A static host may serve the home HTML as its SPA fallback for another URL.
  // Only hydrate matching HTML; otherwise mount the requested route cleanly.
  root.replaceChildren();
  createRoot(root).render(app);
}
