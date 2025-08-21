// Mock WebSocket Server for Development
// This simulates a real-time addon marketplace server

import { WebSocketServer } from 'ws';

const WS_PORT = 3001;

class MockAddonMarketplaceServer {
  constructor() {
    this.wss = new WebSocketServer({ port: WS_PORT });
    this.clients = new Set();
    this.addons = new Map();
    
    this.setupWebSocketServer();
    this.startSimulation();
    
    console.log(`🚀 Mock Addon Marketplace Server running on ws://localhost:${WS_PORT}`);
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      console.log('📱 Client connected to marketplace WebSocket');
      this.clients.add(ws);
      
      // Send initial marketplace sync
      this.sendToClient(ws, {
        type: 'MARKETPLACE_SYNC',
        addons: Array.from(this.addons.values())
      });
      
      ws.on('close', () => {
        console.log('📱 Client disconnected from marketplace WebSocket');
        this.clients.delete(ws);
      });
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('❌ Invalid message from client:', error);
        }
      });
    });
  }

  handleClientMessage(ws, message) {
    switch (message.type) {
      case 'GET_ADDONS':
        this.sendToClient(ws, {
          type: 'MARKETPLACE_SYNC',
          addons: Array.from(this.addons.values())
        });
        break;
      case 'PING':
        this.sendToClient(ws, { type: 'PONG' });
        break;
    }
  }

  sendToClient(client, message) {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  broadcast(message) {
    this.clients.forEach(client => {
      this.sendToClient(client, message);
    });
  }

  startSimulation() {
    // Add some initial mock addons
    this.addInitialAddons();
    
    // Simulate real-time addon additions/removals
    setInterval(() => {
      this.simulateMarketplaceActivity();
    }, 10000); // Every 10 seconds
  }

  addInitialAddons() {
    const initialAddons = [
      {
        id: 'weather-pro-v2',
        name: 'Weather Pro v2',
        description: 'Advanced weather forecasting with AI predictions and satellite imagery.',
        author: 'WeatherTech Solutions',
        version: '2.1.0',
        price: 4.99,
        rating: 4.8,
        downloads: 15420,
        category: 'utilities',
        tags: ['weather', 'forecast', 'AI'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'productivity-suite',
        name: 'Productivity Suite',
        description: 'Complete productivity toolkit with task management, notes, and time tracking.',
        author: 'ProductivityCorp',
        version: '3.0.2',
        price: 12.99,
        rating: 4.6,
        downloads: 8930,
        category: 'productivity',
        tags: ['tasks', 'notes', 'time-tracking'],
        createdAt: '2024-02-20T09:15:00Z',
        updatedAt: new Date().toISOString()
      }
    ];

    initialAddons.forEach(addon => {
      this.addons.set(addon.id, addon);
    });
  }

  simulateMarketplaceActivity() {
    const actions = ['add', 'update', 'remove'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    switch (action) {
      case 'add':
        this.simulateAddonAddition();
        break;
      case 'update':
        this.simulateAddonUpdate();
        break;
      case 'remove':
        this.simulateAddonRemoval();
        break;
    }
  }

  simulateAddonAddition() {
    const newAddon = this.generateRandomAddon();
    this.addons.set(newAddon.id, newAddon);
    
    console.log(`➕ Added new addon: ${newAddon.name}`);
    this.broadcast({
      type: 'ADDON_ADDED',
      addon: newAddon
    });
  }

  simulateAddonUpdate() {
    const addonIds = Array.from(this.addons.keys());
    if (addonIds.length === 0) return;
    
    const randomId = addonIds[Math.floor(Math.random() * addonIds.length)];
    const addon = this.addons.get(randomId);
    
    if (addon) {
      // Update some properties
      addon.version = this.incrementVersion(addon.version);
      addon.downloads += Math.floor(Math.random() * 100) + 10;
      addon.updatedAt = new Date().toISOString();
      
      console.log(`🔄 Updated addon: ${addon.name}`);
      this.broadcast({
        type: 'ADDON_UPDATED',
        addon: addon
      });
    }
  }

  simulateAddonRemoval() {
    const addonIds = Array.from(this.addons.keys());
    if (addonIds.length <= 2) return; // Keep at least 2 addons
    
    const randomId = addonIds[Math.floor(Math.random() * addonIds.length)];
    const addon = this.addons.get(randomId);
    
    if (addon) {
      this.addons.delete(randomId);
      console.log(`🗑️ Removed addon: ${addon.name}`);
      this.broadcast({
        type: 'ADDON_REMOVED',
        addonId: randomId
      });
    }
  }

  generateRandomAddon() {
    const names = [
      'Code Formatter Plus', 'Database Manager', 'API Testing Tool', 
      'Color Picker Pro', 'File Organizer', 'System Monitor',
      'Network Analyzer', 'Password Generator', 'QR Code Creator',
      'Image Optimizer', 'Text Editor Pro', 'Backup Manager'
    ];
    
    const authors = [
      'DevTools Inc', 'CodeCraft Studios', 'TechFlow Solutions',
      'InnovateTech', 'BuildBetter Tools', 'ProDev Systems'
    ];
    
    const categories = ['utilities', 'productivity', 'developer', 'system', 'media'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    
    return {
      id,
      name,
      description: `A powerful ${name.toLowerCase()} with advanced features and seamless integration.`,
      author: authors[Math.floor(Math.random() * authors.length)],
      version: '1.0.0',
      price: Math.random() > 0.6 ? Math.floor(Math.random() * 20) + 2.99 : 0,
      rating: (Math.random() * 2 + 3).toFixed(1),
      downloads: Math.floor(Math.random() * 10000) + 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: ['new', 'popular'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || 0) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  new MockAddonMarketplaceServer();
}

export default MockAddonMarketplaceServer;
