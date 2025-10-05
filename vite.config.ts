import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import componentTagger from "vite-plugin-component-tagger"; // Ensure this is installed

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      ...(mode === "development" ? [componentTagger()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});