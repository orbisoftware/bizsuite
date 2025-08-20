<template>
  <div class="addon-view">
    <div class="addon-header">
      <router-link to="/" class="back-btn">← Back to Dashboard</router-link>
      <h1>{{ addonName }}</h1>
    </div>
    
    <div v-if="addonComponent" class="addon-content">
      <component :is="addonComponent" />
    </div>
    
    <div v-else-if="loading" class="loading">
      Loading addon...
    </div>
    
    <div v-else class="error">
      <h2>Addon not found or disabled</h2>
      <p>The requested addon "{{ addonName }}" is either not found or has been disabled.</p>
      <router-link to="/" class="btn btn-primary">Return to Dashboard</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { loadAddonByName, getAddonState } from '../plugins/loadAddons';

const route = useRoute();
const addonComponent = ref(null);
const loading = ref(true);

const addonName = computed(() => route.params.addonName);

onMounted(async () => {
  try {
    // Check if addon is enabled
    if (!getAddonState(addonName.value)) {
      loading.value = false;
      return;
    }
    
    const addon = await loadAddonByName(addonName.value);
    if (addon) {
      addonComponent.value = addon.component;
    }
  } catch (error) {
    console.error('Error loading addon:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.addon-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.addon-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.back-btn:hover {
  text-decoration: underline;
}

.addon-header h1 {
  margin: 0;
  color: #333;
}

.addon-content {
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  text-align: center;
  padding: 40px;
}

.error h2 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error p {
  color: #666;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
