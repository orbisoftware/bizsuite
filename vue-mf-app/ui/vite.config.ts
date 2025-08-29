import { federation } from "@module-federation/vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  return {
    server: {
      fs: {
        allow: [".", "../shared"],
      },
    },
    base: "http://localhost:4174",
    plugins: [
      federation({
        filename: "remoteEntry.js",
        name: "remote",
        exposes: {
          "./remote-app": "./src/App.vue",
          "./button": "./src/components/Button.vue",
        },
        remotes: {},
      }),
      vue()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        vue: path.resolve(__dirname, "./node_modules/vue/dist/vue.runtime.esm-bundler.js"),
        shared: path.resolve(__dirname, "../shared/shared"),
      },
    },
    build: {
      target: "chrome89",
    },
  };
});
