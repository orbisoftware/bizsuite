<script setup lang="ts">
import { state } from "shared";
console.log("remote got message:", state.message);
</script>

<template>
  <div className="space-y-5 bg-blue-200 p-5 rounded w-fit">
      Click Me
  </div>
  <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
  <!-- make a grid with 3 cols -->
  <div class="grid grid-cols-3 gap-4">
    <div class="col-span-1">
      <p>This is a remote component</p>
    </div>
    <div class="col-span-1">
      <p>Using Module Federation</p>
    </div>
    <div class="col-span-1">
      <p>With Vite and Vue 3</p>
    </div>
  </div>
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