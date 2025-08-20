// counter-addon/api.js
import { ref } from "vue";

// Shared counter state
export const count = ref(0);

// Counter functions that can be used by other addons
export function getCounter() {
  return count.value;
}

export function incrementCounter() {
  count.value++;
}

export function decrementCounter() {
  count.value--;
}

export function setCounter(value) {
  count.value = value;
}

// Export all functions as a single object
export const counterAPI = {
  count,
  getCounter,
  incrementCounter,
  decrementCounter,
  setCounter
};
