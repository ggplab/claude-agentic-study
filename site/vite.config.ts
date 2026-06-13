import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site is served under /<repo>/.
// Override with BASE_PATH env (e.g. "/" for a user/org root site or local preview).
const base = process.env.BASE_PATH ?? "/claude-agentic-study/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
