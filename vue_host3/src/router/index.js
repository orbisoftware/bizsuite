import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import AddonView from '../views/AddonView.vue';
import Marketplace from '../views/Marketplace.vue';
import { getAddonState } from '../plugins/loadAddons';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: Marketplace
  },
  {
    path: '/addon/:addonName',
    name: 'Addon',
    component: AddonView,
    beforeEnter: (to, from, next) => {
      // Check if the addon is enabled
      const addonName = to.params.addonName;
      if (getAddonState(addonName)) {
        next();
      } else {
        // Redirect to dashboard if addon is disabled
        next('/');
      }
    }
  },
  {
    // Catch all route - redirect to dashboard
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
