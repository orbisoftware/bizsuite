<template>
  <div>
    <p>Hello {{ coreAPI.getUser().name }} 👋</p>
  </div>
</template>

<script setup>
import { coreAPI } from "host/core";
coreAPI.log("Hello Addon loaded!");
</script>