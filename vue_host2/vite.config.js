import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      addons: path.resolve(__dirname, "./addons"),
      host: path.resolve(__dirname, "./src"),
      "core": path.resolve(__dirname, "src/core.js"),
      "ui": path.resolve(__dirname, "./src/ui/ui.js"),
      // Add aliases for each addon to enable inter-addon imports
      "counter-addon": path.resolve(__dirname, "./addons/counter-addon"),
      "hello-addon": path.resolve(__dirname, "./addons/hello-addon"),
    }
  }
});