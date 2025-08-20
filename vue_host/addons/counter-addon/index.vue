<template>
  <div>
    <p>Counter: {{ count }}</p>
    <button @click="incrementCounter">+</button>
    <button @click="decrementCounter">-</button>
  </div>
</template>

<script setup>
import { coreAPI } from "core";
import { count, incrementCounter, decrementCounter } from "./api.js";

coreAPI.log("Counter Addon ready");
</script>