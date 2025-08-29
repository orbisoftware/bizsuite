import { state } from "shared";
import { createApp } from "vue";
import App from "./App.vue";

state.message = "Hello from host!";

const app = createApp(App);
app.mount("#app");
