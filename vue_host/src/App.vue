<template>
  <div>
    <h1>Vue + Addons</h1>
    <div v-for="addon in addons" :key="addon.name" class="addon">
      <h2>{{ addon.name }}</h2>
      <component :is="addon.component" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { loadAddons } from "./plugins/loadAddons";

const addons = ref([]);
onMounted(async () => {
  addons.value = await loadAddons();
});
</script>

<style>
.addon {
  margin: 20px;
  padding: 10px;
  border: 1px solid #aaa;
}
</style>