<template>
  <div>
    <p>Counter: {{ count }}</p>
    <button @click="count++">+</button>
    <button @click="count--">-</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { coreAPI } from "host/core";
const count = ref(0);
coreAPI.log("Counter Addon ready");
</script>