import { markRaw } from 'vue';
import YAML from 'yaml';

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
        component: markRaw(module.default) // prevent making the component reactive
      });
    }
  }

  return addons;
}
