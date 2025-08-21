import { markRaw } from 'vue';
import YAML from 'yaml';

// Local storage key for addon states
const ADDON_STATES_KEY = 'vue-addon-states';
// Local storage key for installed community addons
const INSTALLED_COMMUNITY_ADDONS_KEY = 'vue-installed-community-addons';

// Get addon enable/disable states from localStorage
function getAddonStates() {
  try {
    const states = localStorage.getItem(ADDON_STATES_KEY);
    return states ? JSON.parse(states) : {};
  } catch {
    return {};
  }
}

// Save addon states to localStorage
function saveAddonStates(states) {
  try {
    localStorage.setItem(ADDON_STATES_KEY, JSON.stringify(states));
  } catch (error) {
    console.error('Failed to save addon states:', error);
  }
}

// Get the enabled state of a specific addon
export function getAddonState(addonName) {
  const states = getAddonStates();
  // Default to enabled if not set
  return states[addonName] !== false;
}

// Toggle the enabled state of an addon
export function toggleAddonState(addonName) {
  const states = getAddonStates();
  states[addonName] = !getAddonState(addonName);
  saveAddonStates(states);
}

// Load a specific addon by name
export async function loadAddonByName(addonName) {
  const addons = await loadAddons();
  return addons.find(addon => addon.name === addonName);
}

// Get all enabled addons
export async function getEnabledAddons() {
  const addons = await loadAddons();
  return addons.filter(addon => getAddonState(addon.name));
}

// Marketplace functionality

// Get installed community addons from localStorage
function getInstalledCommunityAddons() {
  try {
    const installed = localStorage.getItem(INSTALLED_COMMUNITY_ADDONS_KEY);
    return installed ? JSON.parse(installed) : [];
  } catch {
    return [];
  }
}

// Save installed community addons to localStorage
function saveInstalledCommunityAddons(addonNames) {
  try {
    localStorage.setItem(INSTALLED_COMMUNITY_ADDONS_KEY, JSON.stringify(addonNames));
  } catch (error) {
    console.error('Failed to save installed community addons:', error);
  }
}

// Load all addons from the addons folder (both regular and community)
async function loadAllAddons() {
  const moduleFiles = import.meta.glob('/addons/*/*.vue');
  const manifestFiles = import.meta.glob('/addons/*/manifest.yaml', { query: '?raw', import: 'default' });

  const addons = [];

  for (const manifestPath in manifestFiles) {
    try {
      // Load the YAML manifest as raw text
      const rawText = await manifestFiles[manifestPath]();
      const manifest = YAML.parse(rawText);

      // Only load the specified entry
      const vuePath = manifestPath.replace(/manifest\.yaml$/, manifest.entry);
      if (vuePath in moduleFiles) {
        const module = await moduleFiles[vuePath]();
        addons.push({
          name: manifest.name,
          route: manifest.route,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          community: manifest.community || false,
          price: manifest.price || 0,
          rating: manifest.rating || 0,
          downloads: manifest.downloads || 0,
          component: markRaw(module.default)
        });
      }
    } catch (error) {
      console.error(`Failed to load addon from ${manifestPath}:`, error);
    }
  }

  return addons;
}

// Get marketplace addons (community addons that are not yet installed)
export async function getMarketplaceAddons() {
  const allAddons = await loadAllAddons();
  const installedCommunityAddons = getInstalledCommunityAddons();
  
  // Return community addons that are not installed
  return allAddons
    .filter(addon => addon.community && !installedCommunityAddons.includes(addon.name))
    .map(addon => ({
      id: addon.route, // Use route as unique ID
      name: addon.name,
      description: addon.description,
      author: addon.author,
      version: addon.version,
      price: addon.price,
      rating: addon.rating,
      downloads: addon.downloads,
      entry: 'index.vue',
      route: addon.route,
      component: addon.component
    }));
}

// Check if a community addon is installed
export function isAddonInstalled(addonName) {
  const installed = getInstalledCommunityAddons();
  return installed.includes(addonName);
}

// Install a community addon
export async function installMarketplaceAddon(marketplaceAddon) {
  try {
    const installed = getInstalledCommunityAddons();
    if (!installed.includes(marketplaceAddon.name)) {
      installed.push(marketplaceAddon.name);
      saveInstalledCommunityAddons(installed);
    }

    // Enable the addon by default
    const states = getAddonStates();
    states[marketplaceAddon.name] = true;
    saveAddonStates(states);

    return marketplaceAddon;
  } catch (error) {
    console.error('Failed to install community addon:', error);
    throw error;
  }
}

// Uninstall a community addon
export async function uninstallAddon(addonName) {
  try {
    // Remove from installed community addons
    const installed = getInstalledCommunityAddons();
    const filtered = installed.filter(name => name !== addonName);
    saveInstalledCommunityAddons(filtered);

    // Remove from addon states
    const states = getAddonStates();
    delete states[addonName];
    saveAddonStates(states);

    return true;
  } catch (error) {
    console.error('Failed to uninstall community addon:', error);
    throw error;
  }
}

// Modified loadAddons function to include only regular addons and installed community addons
export async function loadAddons() {
  const allAddons = await loadAllAddons();
  const installedCommunityAddons = getInstalledCommunityAddons();
  
  // Return regular addons (community: false or undefined) and installed community addons
  return allAddons.filter(addon => 
    !addon.community || installedCommunityAddons.includes(addon.name)
  );
}

// Original function renamed to loadLocalAddons (now unused, kept for reference)
async function loadLocalAddons() {
  // This function is no longer used - keeping for reference
  const moduleFiles = import.meta.glob('/addons/*/*.vue');
  const manifestFiles = import.meta.glob('/addons/*/manifest.yaml', { query: '?raw', import: 'default' });

  const addons = [];

  for (const manifestPath in manifestFiles) {
    // Load the YAML manifest as raw text
    const rawText = await manifestFiles[manifestPath]();
    const manifest = YAML.parse(rawText);

    // Only load the specified entry
    const vuePath = manifestPath.replace(/manifest\.yaml$/, manifest.entry);
    if (vuePath in moduleFiles) {
      const module = await moduleFiles[vuePath]();
      addons.push({
        name: manifest.name,
        route: manifest.route,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        component: markRaw(module.default) // prevent making the component reactive
      });
    }
  }

  return addons;
}
