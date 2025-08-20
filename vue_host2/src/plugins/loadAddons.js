import { markRaw } from 'vue';
import YAML from 'yaml';

// Local storage key for addon states
const ADDON_STATES_KEY = 'vue-addon-states';

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

// Load all addons with their metadata
export async function loadAddons() {
  // Scan all addon Vue files
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
