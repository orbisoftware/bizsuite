<template>
  <div class="marketplace">
    <div class="marketplace-header">
      <h1>Addon Marketplace</h1>
      <p>Discover and install new addons to extend your application.</p>
      
      <div class="status-bar">
        <div class="connection-status" :class="{ online: isOnline, offline: !isOnline }">
          <span class="status-indicator"></span>
          {{ isOnline ? 'Online' : 'Offline' }}
        </div>
        <div v-if="lastUpdated" class="last-updated">
          Last updated: {{ formatDate(lastUpdated) }}
        </div>
        <button @click="refreshMarketplace" class="btn btn-refresh" :disabled="!isOnline">
          🔄 Refresh
        </button>
      </div>
      
      <div class="marketplace-nav">
        <button 
          :class="['nav-btn', { active: activeTab === 'available' }]"
          @click="activeTab = 'available'"
        >
          Available ({{ availableAddons.length }})
        </button>
        <button 
          :class="['nav-btn', { active: activeTab === 'installed' }]"
          @click="activeTab = 'installed'"
        >
          Installed ({{ installedAddons.length }})
        </button>
        <button 
          :class="['nav-btn', { active: activeTab === 'admin' }]"
          @click="activeTab = 'admin'"
        >
          🔧 Add Addon
        </button>
      </div>
    </div>

    <div class="search-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search addons..." 
        class="search-input"
      >
      <select v-model="sortBy" class="sort-select">
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
        <option value="rating">Sort by Rating</option>
        <option value="downloads">Sort by Downloads</option>
        <option value="newest">Sort by Newest</option>
        <option value="updated">Sort by Recently Updated</option>
      </select>
    </div>

    <!-- Admin Section -->
    <div v-if="activeTab === 'admin'" class="admin-section">
      <h2>Add New Addon to Marketplace</h2>
      <div class="admin-form">
        <div class="form-group">
          <label for="addonTitle">Addon Title:</label>
          <input 
            id="addonTitle"
            v-model="newAddon.title" 
            type="text" 
            placeholder="Enter addon title..."
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="addonContent">Addon Content (HTML):</label>
          <textarea 
            id="addonContent"
            v-model="newAddon.content"
            placeholder="Enter addon HTML content..."
            class="form-textarea"
            rows="10"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button @click="addAddonToMarketplace" class="btn btn-success" :disabled="!canAddAddon">
            🚀 Add to Marketplace
          </button>
          <button @click="clearForm" class="btn btn-secondary">
            🗑️ Clear Form
          </button>
        </div>
        
        <div class="form-preview" v-if="newAddon.title || newAddon.content">
          <h3>Preview:</h3>
          <div class="preview-card">
            <h4>{{ newAddon.title || 'Untitled Addon' }}</h4>
            <div class="preview-content" v-html="newAddon.content || 'No content provided'"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="addon-grid">
      <!-- Available Addons -->
      <div 
        v-if="activeTab === 'available'"
        v-for="addon in filteredAvailableAddons" 
        :key="addon.id" 
        class="addon-card available"
      >
        <div class="addon-image">
          <img :src="addon.image || '/placeholder-addon.png'" :alt="addon.name">
        </div>
        
        <div class="addon-content">
          <div class="addon-header">
            <h3>{{ addon.name }}</h3>
            <div class="addon-rating">
              <span class="stars">★★★★☆</span>
              <span class="rating-text">({{ addon.rating || 4.2 }})</span>
            </div>
          </div>
          
          <p class="addon-description">{{ addon.description }}</p>
          <p class="addon-author">By: {{ addon.author }}</p>
          <p class="addon-downloads">{{ formatDownloads(addon.downloads || 1250) }} downloads</p>
          <div class="addon-meta">
            <span class="addon-category" v-if="addon.category">{{ addon.category }}</span>
            <span class="addon-date">Updated: {{ formatDate(addon.updatedAt) }}</span>
          </div>
          
          <div class="addon-footer">
            <div class="addon-price">
              <span v-if="addon.price === 0" class="free">FREE</span>
              <span v-else class="paid">${{ addon.price }}</span>
            </div>
            
            <button 
              @click="installAddonFromMarketplace(addon)"
              :disabled="isInstalling(addon.id)"
              class="btn btn-install"
            >
              <span v-if="isInstalling(addon.id)">Installing...</span>
              <span v-else-if="addon.price === 0">Install</span>
              <span v-else>Buy & Install</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Installed Addons -->
      <div 
        v-if="activeTab === 'installed'"
        v-for="addon in filteredInstalledAddons" 
        :key="addon.id" 
        class="addon-card installed"
      >
        <div class="addon-image">
          <img :src="addon.image || '/placeholder-addon.png'" :alt="addon.name">
        </div>
        
        <div class="addon-content">
          <div class="addon-header">
            <h3>{{ addon.name }}</h3>
            <span class="installed-badge">Installed</span>
          </div>
          
          <p class="addon-description">{{ addon.description }}</p>
          <p class="addon-version">Version: {{ addon.version }}</p>
          <p class="addon-author">By: {{ addon.author }}</p>
          
          <div class="addon-footer">
            <router-link 
              :to="`/addon/${addon.name}`" 
              class="btn btn-primary"
            >
              Open Addon
            </router-link>
            
            <button 
              @click="uninstallAddonFromDashboard(addon)"
              class="btn btn-danger"
            >
              Uninstall
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredAddons.length === 0" class="no-results">
      <p>No addons found matching your search criteria.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAddonManager } from '../plugins/dynamicAddonManager';
import { 
  loadAddons, 
  uninstallAddon as removeAddon,
  isAddonInstalled 
} from '../plugins/loadAddons';

const router = useRouter();
const { store: addonStore, installAddon, uninstallAddon, checkForUpdates, notifyUser } = useAddonManager();

const activeTab = ref('available');
const searchQuery = ref('');
const sortBy = ref('name');
const installedAddons = ref([]);
const installingAddons = ref(new Set());
const isOnline = ref(navigator.onLine);

// New addon form data
const newAddon = ref({
  title: '',
  content: ''
});

// Real-time connection status
let connectionCheckInterval;

onMounted(async () => {
  await loadInstalledAddons();
  setupConnectionMonitoring();
  
  // Check for updates every 30 seconds
  connectionCheckInterval = setInterval(() => {
    if (isOnline.value) {
      checkForUpdates();
    }
  }, 30000);
});

onUnmounted(() => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
});

function setupConnectionMonitoring() {
  window.addEventListener('online', () => {
    isOnline.value = true;
    notifyUser('Connection restored. Checking for addon updates...', 'success');
    checkForUpdates();
  });
  
  window.addEventListener('offline', () => {
    isOnline.value = false;
    notifyUser('Connection lost. Marketplace updates paused.', 'info');
  });
}

async function loadInstalledAddons() {
  const addons = await loadAddons();
  installedAddons.value = addons;
}

// Use reactive store data
const availableAddons = computed(() => addonStore.availableAddons);
const lastUpdated = computed(() => addonStore.lastUpdated);

const filteredAvailableAddons = computed(() => {
  return filterAndSortAddons(availableAddons.value);
});

const filteredInstalledAddons = computed(() => {
  return filterAndSortAddons(installedAddons.value);
});

const filteredAddons = computed(() => {
  return activeTab.value === 'available' ? filteredAvailableAddons.value : filteredInstalledAddons.value;
});

// Check if addon can be added
const canAddAddon = computed(() => {
  return newAddon.value.title.trim() !== '' && newAddon.value.content.trim() !== '';
});

function filterAndSortAddons(addons) {
  let filtered = addons;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(addon =>
      addon.name.toLowerCase().includes(query) ||
      addon.description.toLowerCase().includes(query) ||
      addon.author.toLowerCase().includes(query) ||
      (addon.category && addon.category.toLowerCase().includes(query)) ||
      (addon.tags && addon.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'downloads':
        return (b.downloads || 0) - (a.downloads || 0);
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'updated':
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      default:
        return 0;
    }
  });
  
  return filtered;
}

async function installAddonFromMarketplace(addon) {
  if (installingAddons.value.has(addon.id)) return;
  
  installingAddons.value.add(addon.id);
  
  try {
    // Simulate purchase/payment for paid addons
    if (addon.price > 0) {
      const confirmed = confirm(`Purchase ${addon.name} for $${addon.price}?`);
      if (!confirmed) {
        return;
      }
      
      // Simulate payment processing
      notifyUser(`Processing payment for ${addon.name}...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Install the addon dynamically
    await installAddon(addon);
    
    // Reload installed addons list
    await loadInstalledAddons();
    
  } catch (error) {
    console.error('Failed to install addon:', error);
    notifyUser(`Failed to install ${addon.name}. Please try again.`, 'error');
  } finally {
    installingAddons.value.delete(addon.id);
  }
}

async function uninstallAddonFromDashboard(addon) {
  const confirmed = confirm(`Are you sure you want to uninstall ${addon.name}?`);
  if (!confirmed) return;
  
  try {
    // If it's a community addon, use dynamic uninstall
    if (addon.community || addon.id) {
      await uninstallAddon(addon.id || addon.name);
    } else {
      // Use traditional uninstall for local addons
      await removeAddon(addon.name);
    }
    
    // Reload both lists
    await loadInstalledAddons();
    
  } catch (error) {
    console.error('Failed to uninstall addon:', error);
    notifyUser(`Failed to uninstall ${addon.name}. Please try again.`, 'error');
  }
}

function isInstalling(addonId) {
  return installingAddons.value.has(addonId);
}

function formatDownloads(downloads) {
  if (downloads >= 1000000) {
    return (downloads / 1000000).toFixed(1) + 'M';
  } else if (downloads >= 1000) {
    return (downloads / 1000).toFixed(1) + 'K';
  }
  return downloads.toString();
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
}

async function refreshMarketplace() {
  if (!isOnline.value) {
    notifyUser('No internet connection available', 'error');
    return;
  }
  
  try {
    notifyUser('Refreshing marketplace...', 'info');
    await checkForUpdates();
    notifyUser('Marketplace updated successfully', 'success');
  } catch (error) {
    notifyUser('Failed to refresh marketplace', 'error');
  }
}

// Add new addon to marketplace
async function addAddonToMarketplace() {
  if (!canAddAddon.value) {
    notifyUser('Please fill in both title and content', 'error');
    return;
  }
  
  try {
    // Create addon object
    const addon = {
      id: newAddon.value.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: newAddon.value.title.trim(),
      description: `Custom addon: ${newAddon.value.title}`,
      author: 'Anonymous Developer',
      version: '1.0.0',
      price: 0,
      rating: 4.0,
      downloads: 0,
      category: 'custom',
      tags: ['custom', 'user-created'],
      content: newAddon.value.content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to available addons (simulate real-time addition)
    addonStore.availableAddons.push(addon);
    
    // Clear form
    clearForm();
    
    // Switch to available tab
    activeTab.value = 'available';
    
    notifyUser(`Successfully added "${addon.name}" to marketplace!`, 'success');
    
    // In a real app, you would send this to the server
    console.log('New addon added:', addon);
    
  } catch (error) {
    console.error('Failed to add addon:', error);
    notifyUser('Failed to add addon to marketplace', 'error');
  }
}

// Clear the form
function clearForm() {
  newAddon.value.title = '';
  newAddon.value.content = '';
}
</script>

<style scoped>
.marketplace {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.marketplace-header {
  text-align: center;
  margin-bottom: 30px;
}

.status-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9em;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.connection-status.online .status-indicator {
  background: #28a745;
}

.connection-status.offline .status-indicator {
  background: #dc3545;
  animation: none;
}

.last-updated {
  color: #666;
}

.btn-refresh {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh:hover:not(:disabled) {
  background: #138496;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.marketplace-nav {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.nav-btn {
  padding: 10px 20px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f8f9fa;
}

.nav-btn.active {
  background: #007bff;
  color: white;
}

.search-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  min-width: 300px;
}

.sort-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background: white;
}

.addon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.addon-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.addon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.15);
}

.addon-image {
  height: 180px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.addon-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.addon-content {
  padding: 20px;
}

.addon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.addon-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
}

.addon-rating {
  text-align: right;
  font-size: 0.9em;
}

.stars {
  color: #ffc107;
  margin-right: 5px;
}

.rating-text {
  color: #666;
}

.installed-badge {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
}

.addon-description {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
}

.addon-author, .addon-version, .addon-downloads {
  font-size: 0.9em;
  color: #888;
  margin: 5px 0;
}

.addon-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  font-size: 0.8em;
}

.addon-category {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.addon-date {
  color: #6c757d;
}

.addon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.addon-price {
  font-weight: bold;
  font-size: 1.1em;
}

.addon-price .free {
  color: #28a745;
}

.addon-price .paid {
  color: #007bff;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  margin-right: 10px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-install {
  background-color: #28a745;
  color: white;
}

.btn-install:hover:not(:disabled) {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.1em;
}

.available {
  border-left: 4px solid #007bff;
}

.installed {
  border-left: 4px solid #28a745;
}

/* Admin Section Styles */
.admin-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.admin-section h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.admin-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: 'Courier New', monospace;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.form-preview {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-preview h3 {
  color: #333;
  margin-bottom: 15px;
}

.preview-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.preview-card h4 {
  color: #007bff;
  margin-bottom: 15px;
}

.preview-content {
  color: #495057;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .addon-grid {
    grid-template-columns: 1fr;
  }
  
  .search-section {
    flex-direction: column;
    align-items: center;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .addon-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
