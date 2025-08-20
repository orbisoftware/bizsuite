// src/plugins/loadAddons.js
export async function loadAddons() {
  // Scan all addon Vue files
  const modules = import.meta.glob('/addons/*/*.vue');

  const addons = [];

  for (const path in modules) {
    const manifestPath = path.replace(/index\.vue$/, 'manifest.json');
    // Load manifest
    const manifestModule = await import(/* @vite-ignore */ manifestPath);
    const manifest = manifestModule.default;

    if (manifest.entry === 'index.vue') {
      const module = await modules[path](); // load Vue component
      addons.push({ name: manifest.name, component: module.default });
    }
  }

  return addons;
}
