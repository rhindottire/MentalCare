import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";

const appName = import.meta.env.VITE_APP_NAME || "SIM-KEMAS";

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ComponentType }>(
      "./Pages/**/*.tsx",
    );
    const module = await pages[`./Pages/${name}.tsx`]();
    return module.default;
  },
  setup({ el, App, props }) {
    if (el) {
      createRoot(el).render(<App {...props} />);
    }
  },
  progress: {
    color: "#4f46e5",
  },
});
