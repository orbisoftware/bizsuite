// Dynamic Addon Management System
import { ref, reactive } from 'vue';
import { markRaw } from 'vue';

// Reactive addon store
const addonStore = reactive({
  availableAddons: [],
  installedAddons: [],
  lastUpdated: null
});

// WebSocket connection for real-time updates
let wsConnection = null;

// API endpoints
const API_BASE = '/api/addons';

class AddonManager {
  constructor() {
    this.initializeWebSocket();
    this.loadInitialData();
  }

  // Initialize WebSocket connection for real-time updates
  initializeWebSocket() {
    if (typeof window === 'undefined') return;
    
    try {
      // In development, use local WebSocket
      const wsUrl = import.meta.env.DEV 
        ? 'ws://localhost:3001/addons-ws'
        : `wss://${window.location.host}/addons-ws`;
      
      wsConnection = new WebSocket(wsUrl);
      
      wsConnection.onopen = () => {
        console.log('🔌 Connected to addon marketplace WebSocket');
      };
      
      wsConnection.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };
      
      wsConnection.onclose = () => {
        console.log('🔌 Disconnected from addon marketplace WebSocket');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
      
      wsConnection.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
    } catch (error) {
      console.warn('⚠️ WebSocket not available, falling back to polling');
      this.startPolling();
    }
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'ADDON_ADDED':
        this.addAddonToMarketplace(message.addon);
        break;
      case 'ADDON_REMOVED':
        this.removeAddonFromMarketplace(message.addonId);
        break;
      case 'ADDON_UPDATED':
        this.updateAddonInMarketplace(message.addon);
        break;
      case 'MARKETPLACE_SYNC':
        this.syncMarketplace(message.addons);
        break;
      default:
        console.log('📨 Unknown message type:', message.type);
    }
  }

  // Fallback polling mechanism
  startPolling() {
    setInterval(async () => {
      await this.checkForUpdates();
    }, 30000); // Poll every 30 seconds
  }

  // Load initial marketplace data
  async loadInitialData() {
    try {
      // In development mode, use mock data
      if (import.meta.env.DEV) {
        this.loadMockData();
        return;
      }

      const response = await fetch(`${API_BASE}/marketplace`);
      const data = await response.json();
      
      addonStore.availableAddons = data.addons || [];
      addonStore.lastUpdated = new Date().toISOString();
    } catch (error) {
      console.error('❌ Failed to load marketplace data:', error);
      this.loadMockData();
    }
  }

  // Mock data for development
  loadMockData() {
    addonStore.availableAddons = [
      {
        id: 'weather-pro',
        name: 'Weather Pro',
        description: 'Advanced weather forecasting with satellite imagery and severe weather alerts.',
        author: 'WeatherTech Solutions',
        version: '2.1.0',
        price: 4.99,
        rating: 4.8,
        downloads: 15420,
        category: 'utilities',
        tags: ['weather', 'forecast', 'alerts'],
        screenshots: ['/screenshots/weather-1.jpg', '/screenshots/weather-2.jpg'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-08-01T14:30:00Z'
      },
      {
        id: 'task-master',
        name: 'Task Master',
        description: 'Professional task management with team collaboration and time tracking.',
        author: 'ProductivityCorp',
        version: '3.0.2',
        price: 9.99,
        rating: 4.6,
        downloads: 8930,
        category: 'productivity',
        tags: ['tasks', 'collaboration', 'time-tracking'],
        screenshots: ['/screenshots/tasks-1.jpg'],
        createdAt: '2024-02-20T09:15:00Z',
        updatedAt: '2024-08-10T11:45:00Z'
      },
      {
        id: 'code-snippets',
        name: 'Code Snippets Manager',
        description: 'Organize and share your code snippets with syntax highlighting and search.',
        author: 'DevTools Inc',
        version: '1.5.3',
        price: 0,
        rating: 4.9,
        downloads: 22100,
        category: 'developer',
        tags: ['code', 'snippets', 'productivity'],
        screenshots: ['/screenshots/code-1.jpg', '/screenshots/code-2.jpg'],
        createdAt: '2024-03-10T16:20:00Z',
        updatedAt: '2024-08-15T09:10:00Z'
      }
    ];
    addonStore.lastUpdated = new Date().toISOString();
  }

  // Check for marketplace updates
  async checkForUpdates() {
    try {
      const response = await fetch(`${API_BASE}/marketplace/updates?since=${addonStore.lastUpdated}`);
      const data = await response.json();
      
      if (data.hasUpdates) {
        this.syncMarketplace(data.addons);
      }
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
    }
  }

  // Add new addon to marketplace
  addAddonToMarketplace(addon) {
    const existingIndex = addonStore.availableAddons.findIndex(a => a.id === addon.id);
    if (existingIndex === -1) {
      addonStore.availableAddons.push(addon);
      console.log(`✅ Added new addon: ${addon.name}`);
      this.notifyUser(`New addon available: ${addon.name}`, 'success');
    }
  }

  // Remove addon from marketplace
  removeAddonFromMarketplace(addonId) {
    const index = addonStore.availableAddons.findIndex(a => a.id === addonId);
    if (index !== -1) {
      const addon = addonStore.availableAddons[index];
      addonStore.availableAddons.splice(index, 1);
      console.log(`🗑️ Removed addon: ${addon.name}`);
      this.notifyUser(`Addon removed from marketplace: ${addon.name}`, 'info');
    }
  }

  // Update existing addon in marketplace
  updateAddonInMarketplace(addon) {
    const index = addonStore.availableAddons.findIndex(a => a.id === addon.id);
    if (index !== -1) {
      addonStore.availableAddons[index] = addon;
      console.log(`🔄 Updated addon: ${addon.name}`);
      this.notifyUser(`Addon updated: ${addon.name}`, 'info');
    }
  }

  // Sync entire marketplace
  syncMarketplace(addons) {
    addonStore.availableAddons = addons;
    addonStore.lastUpdated = new Date().toISOString();
    console.log('🔄 Marketplace synchronized');
  }

  // Install addon dynamically
  async installAddon(addon) {
    try {
      let compiledComponent;
      
      // Check if addon has custom content
      if (addon.content) {
        compiledComponent = this.createCustomContentComponent(addon);
      } else {
        // Download and compile addon code
        const addonCode = await this.downloadAddonCode(addon.id);
        compiledComponent = await this.compileAddonComponent(addonCode);
      }
      
      // Create addon object
      const installedAddon = {
        ...addon,
        component: markRaw(compiledComponent),
        installedAt: new Date().toISOString()
      };

      // Add to installed addons
      addonStore.installedAddons.push(installedAddon);
      
      // Remove from available addons
      const index = addonStore.availableAddons.findIndex(a => a.id === addon.id);
      if (index !== -1) {
        addonStore.availableAddons.splice(index, 1);
      }

      // Save to localStorage
      this.saveInstalledAddons();
      
      console.log(`📦 Installed addon: ${addon.name}`);
      this.notifyUser(`Successfully installed: ${addon.name}`, 'success');
      
      return installedAddon;
    } catch (error) {
      console.error('❌ Failed to install addon:', error);
      this.notifyUser(`Failed to install: ${addon.name}`, 'error');
      throw error;
    }
  }

  // Download addon code from server
  async downloadAddonCode(addonId) {
    if (import.meta.env.DEV) {
      // In development, return mock component code
      return this.getMockAddonCode(addonId);
    }

    const response = await fetch(`${API_BASE}/download/${addonId}`);
    if (!response.ok) {
      throw new Error(`Failed to download addon: ${response.statusText}`);
    }
    
    return await response.text();
  }

  // Get mock addon code for development
  getMockAddonCode(addonId) {
    return `
      <template>
        <div class="dynamic-addon" :class="addonId">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
          <div class="addon-info">
            <p><strong>ID:</strong> {{ addonId }}</p>
            <p><strong>Loaded:</strong> {{ loadedAt }}</p>
            <p><strong>Type:</strong> Dynamic Addon</p>
          </div>
          <div class="demo-actions">
            <button @click="counter++" class="btn">
              Clicked {{ counter }} times
            </button>
            <button @click="showMessage" class="btn">
              Show Message
            </button>
          </div>
          <div v-if="message" class="message">{{ message }}</div>
        </div>
      </template>

      <script>
      export default {
        name: '${addonId}',
        data() {
          return {
            title: 'Dynamic Addon: ${addonId}',
            description: 'This addon was loaded dynamically at runtime!',
            addonId: '${addonId}',
            loadedAt: new Date().toLocaleString(),
            counter: 0,
            message: ''
          }
        },
        methods: {
          showMessage() {
            this.message = 'Hello from dynamically loaded addon!';
            setTimeout(() => this.message = '', 3000);
          }
        }
      }
      </script>

      <style scoped>
      .dynamic-addon {
        padding: 20px;
        border: 2px solid #007bff;
        border-radius: 8px;
        background: white;
      }
      .addon-info {
        background: #f8f9fa;
        padding: 15px;
        margin: 15px 0;
        border-radius: 6px;
      }
      .demo-actions {
        margin: 15px 0;
      }
      .btn {
        margin: 5px;
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .message {
        padding: 10px;
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        color: #155724;
        margin-top: 10px;
      }
      </style>
    `;
  }

  // Create component from custom content
  createCustomContentComponent(addon) {
    return {
      name: addon.id,
      template: `
        <div class="custom-addon">
          <div class="addon-header">
            <h2>{{ title }}</h2>
            <div class="addon-meta">
              <span class="addon-badge">Custom</span>
              <span class="addon-version">v{{ version }}</span>
            </div>
          </div>
          
          <div class="addon-content" v-html="content"></div>
          
          <div class="addon-footer">
            <p><strong>Author:</strong> {{ author }}</p>
            <p><strong>Installed:</strong> {{ installedAt }}</p>
          </div>
        </div>
      `,
      data() {
        return {
          title: addon.name,
          content: addon.content,
          author: addon.author,
          version: addon.version,
          installedAt: new Date().toLocaleString()
        };
      }
    };
  }

  // Compile addon component from source code
  async compileAddonComponent(sourceCode) {
    // In a real implementation, you would use Vue's compiler
    // For this demo, we'll create a simple component factory
    
    try {
      // Parse the component (simplified for demo)
      const component = this.parseVueComponent(sourceCode);
      return component;
    } catch (error) {
      console.error('❌ Failed to compile component:', error);
      throw error;
    }
  }

  // Simplified Vue component parser (for demo purposes)
  parseVueComponent(sourceCode) {
    // In production, you'd use @vue/compiler-sfc or similar
    // This is a simplified version for demonstration
    
    const templateMatch = sourceCode.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = sourceCode.match(/<script>([\s\S]*?)<\/script>/);
    const styleMatch = sourceCode.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    
    const template = templateMatch ? templateMatch[1] : '<div>Loading...</div>';
    
    // Create a basic component definition
    return {
      template: template,
      data() {
        return {
          title: 'Dynamic Addon',
          description: 'This addon was loaded dynamically!',
          loadedAt: new Date().toLocaleString(),
          counter: 0,
          message: ''
        };
      },
      methods: {
        showMessage() {
          this.message = 'Hello from dynamically loaded addon!';
          setTimeout(() => this.message = '', 3000);
        }
      }
    };
  }

  // Uninstall addon
  async uninstallAddon(addonId) {
    try {
      const index = addonStore.installedAddons.findIndex(a => a.id === addonId);
      if (index !== -1) {
        const addon = addonStore.installedAddons[index];
        addonStore.installedAddons.splice(index, 1);
        
        // Add back to available addons
        const marketplaceAddon = await this.getAddonFromMarketplace(addonId);
        if (marketplaceAddon) {
          addonStore.availableAddons.push(marketplaceAddon);
        }
        
        this.saveInstalledAddons();
        console.log(`🗑️ Uninstalled addon: ${addon.name}`);
        this.notifyUser(`Uninstalled: ${addon.name}`, 'info');
      }
    } catch (error) {
      console.error('❌ Failed to uninstall addon:', error);
      throw error;
    }
  }

  // Get addon info from marketplace
  async getAddonFromMarketplace(addonId) {
    try {
      if (import.meta.env.DEV) {
        // Return from mock data
        return addonStore.availableAddons.find(a => a.id === addonId);
      }

      const response = await fetch(`${API_BASE}/marketplace/${addonId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get addon from marketplace:', error);
      return null;
    }
  }

  // Save installed addons to localStorage
  saveInstalledAddons() {
    try {
      const addonData = addonStore.installedAddons.map(addon => ({
        id: addon.id,
        name: addon.name,
        version: addon.version,
        installedAt: addon.installedAt
      }));
      localStorage.setItem('dynamic-installed-addons', JSON.stringify(addonData));
    } catch (error) {
      console.error('❌ Failed to save installed addons:', error);
    }
  }

  // Load installed addons from localStorage
  loadInstalledAddons() {
    try {
      const saved = localStorage.getItem('dynamic-installed-addons');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Failed to load installed addons:', error);
      return [];
    }
  }

  // Show notification to user
  notifyUser(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Get reactive addon store
  getStore() {
    return addonStore;
  }

  // Cleanup
  destroy() {
    if (wsConnection) {
      wsConnection.close();
    }
  }
}

// Create global addon manager instance
const addonManager = new AddonManager();

// Export functions for use in components
export const useAddonManager = () => {
  return {
    store: addonManager.getStore(),
    installAddon: (addon) => addonManager.installAddon(addon),
    uninstallAddon: (addonId) => addonManager.uninstallAddon(addonId),
    checkForUpdates: () => addonManager.checkForUpdates(),
    notifyUser: (message, type) => addonManager.notifyUser(message, type)
  };
};

export default addonManager;
