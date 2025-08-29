<script setup lang="ts">
import { state } from "shared";
console.log("remote got message:", state.message);
</script>

<template>
  <button @click="state.message = 'Hello from Remote'">
    Click
  </button>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: cadetblue;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>