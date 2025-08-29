import { state } from "shared";
import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

state.message = "Hello from host!";

const app = createApp(App);
app.mount("#app");
