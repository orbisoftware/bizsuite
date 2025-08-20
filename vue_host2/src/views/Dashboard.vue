<template>
  <div class="dashboard">
    <h1>Addon Dashboard</h1>
    <p>Manage your addons below. Only enabled addons can be accessed.</p>
    
    <div class="addon-grid">
      <div v-for="addon in addons" :key="addon.name" class="addon-card">
        <div class="addon-header">
          <h3>{{ addon.name }}</h3>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="addon.enabled" 
              @change="toggleAddon(addon.name)"
            >
            <span class="slider"></span>
          </label>
        </div>
        
        <p class="addon-description">{{ addon.description }}</p>
        <p class="addon-version">Version: {{ addon.version }}</p>
        <p class="addon-author">By: {{ addon.author }}</p>
        
        <div class="addon-actions">
          <router-link 
            v-if="addon.enabled" 
            :to="`/addon/${addon.name}`" 
            class="btn btn-primary"
          >
            Open Addon
          </router-link>
          <span v-else class="btn btn-disabled">
            Disabled
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadAddons, toggleAddonState, getAddonState } from '../plugins/loadAddons';

const addons = ref([]);

onMounted(async () => {
  const loadedAddons = await loadAddons();
  addons.value = loadedAddons.map(addon => ({
    ...addon,
    enabled: getAddonState(addon.name)
  }));
});

function toggleAddon(addonName) {
  toggleAddonState(addonName);
  const addon = addons.value.find(a => a.name === addonName);
  if (addon) {
    addon.enabled = !addon.enabled;
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.addon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.addon-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.addon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.addon-header h3 {
  margin: 0;
  color: #333;
}

.addon-description {
  color: #666;
  margin-bottom: 10px;
}

.addon-version, .addon-author {
  font-size: 0.9em;
  color: #888;
  margin: 5px 0;
}

.addon-actions {
  margin-top: 15px;
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

.btn-disabled {
  background-color: #6c757d;
  color: white;
  cursor: not-allowed;
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
