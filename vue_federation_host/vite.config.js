import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "host",
      filename: "remoteEntry.js",
      exposes: {
        "./core": "./src/core.js"
      },
      shared: ["vue", "pinia"]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      addons: path.resolve(__dirname, "./addons"),
      host: path.resolve(__dirname, "./src")
    }
  }
});