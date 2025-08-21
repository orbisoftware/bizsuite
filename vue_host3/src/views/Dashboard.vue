<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Addon Dashboard</h1>
      <p>Manage your addons below. Only enabled addons can be accessed.</p>
      
      <div class="dashboard-actions">
        <router-link to="/marketplace" class="btn btn-marketplace">
          🛒 Browse Marketplace
        </router-link>
      </div>
    </div>
    
    <div class="addon-grid">
      <div v-for="addon in addons" :key="addon.name" class="addon-card" :class="{ 'marketplace-addon': isMarketplaceAddon(addon) }">
        <div class="addon-header">
          <div class="addon-title-section">
            <h3>{{ addon.name }}</h3>
            <span v-if="isMarketplaceAddon(addon)" class="marketplace-badge">Marketplace</span>
          </div>
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
          
          <button 
            v-if="isMarketplaceAddon(addon)" 
            @click="uninstallAddon(addon)"
            class="btn btn-danger btn-small"
          >
            Uninstall
          </button>
        </div>
      </div>
    </div>

    <div v-if="addons.length === 0" class="no-addons">
      <h3>No addons installed</h3>
      <p>Visit the marketplace to discover and install new addons.</p>
      <router-link to="/marketplace" class="btn btn-marketplace">
        Browse Marketplace
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { loadAddons, toggleAddonState, getAddonState, uninstallAddon as removeAddon } from '../plugins/loadAddons';
import { useAddonManager } from '../plugins/dynamicAddonManager';

const { store: addonStore, uninstallAddon: uninstallDynamicAddon } = useAddonManager();
const addons = ref([]);

onMounted(async () => {
  await loadDashboardAddons();
});

async function loadDashboardAddons() {
  const loadedAddons = await loadAddons();
  
  // Also include installed dynamic addons from the addon manager
  const dynamicAddons = addonStore.installedAddons.map(addon => ({
    ...addon,
    community: true,
    enabled: getAddonState(addon.name)
  }));
  
  addons.value = [...loadedAddons, ...dynamicAddons].map(addon => ({
    ...addon,
    enabled: getAddonState(addon.name)
  }));
}

function toggleAddon(addonName) {
  toggleAddonState(addonName);
  const addon = addons.value.find(a => a.name === addonName);
  if (addon) {
    addon.enabled = !addon.enabled;
  }
}

function isMarketplaceAddon(addon) {
  // Community addons have a 'community' property set to true
  return addon.community === true;
}

async function uninstallAddon(addon) {
  const confirmed = confirm(`Are you sure you want to uninstall ${addon.name}?`);
  if (!confirmed) return;
  
  try {
    // If it's a dynamic addon, use the dynamic uninstall
    if (addon.id && isMarketplaceAddon(addon)) {
      await uninstallDynamicAddon(addon.id);
    } else {
      // Use traditional uninstall for local addons
      await removeAddon(addon.name);
    }
    
    await loadDashboardAddons(); // Reload the addons list
    alert(`${addon.name} has been uninstalled.`);
  } catch (error) {
    console.error('Failed to uninstall addon:', error);
    alert(`Failed to uninstall ${addon.name}. Please try again.`);
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-actions {
  margin-top: 20px;
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.addon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.addon-card.marketplace-addon {
  border-left: 4px solid #007bff;
}

.addon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.addon-title-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.addon-header h3 {
  margin: 0;
  color: #333;
}

.marketplace-badge {
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: 500;
  align-self: flex-start;
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
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-small {
  padding: 6px 12px;
  font-size: 0.8em;
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

.btn-marketplace {
  background-color: #28a745;
  color: white;
}

.btn-marketplace:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.no-addons {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-addons h3 {
  margin-bottom: 10px;
  color: #333;
}

.no-addons p {
  margin-bottom: 20px;
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

@media (max-width: 768px) {
  .addon-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
