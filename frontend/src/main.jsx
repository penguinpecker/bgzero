import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";

// Prerendered content is already HTML; only the studio and journal need React.
async function initialize() {
  if (import.meta.env.DEV) {
    const { default: App } = await import("./App");
    createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App path={window.location.pathname} />
      </React.StrictMode>,
    );
  } else if (document.getElementById("studio-root")) {
    const { default: Studio } = await import("./components/Studio");
    hydrateRoot(document.getElementById("studio-root"), <Studio />);
  } else if (document.getElementById("journal-root")) {
    const { Journal } = await import("./components/Journal");
    hydrateRoot(document.getElementById("journal-root"), <Journal />);
  }
}
initialize();
