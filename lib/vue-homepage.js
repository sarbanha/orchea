/**
 * Project:   Orchea - Modular Documentation System
 * File:      vue-homepage.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js application initialization for the homepage.
 *   Sets up the main app instance and component registration.
 *
 * License: MIT
 */

// Vue App for Homepage
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            title: 'Orchea - Modular Documentation System'
        }
    }
});

// Register components
app.component('app-header', AppHeader);
app.component('homepage-content', HomepageContent);
app.component('app-footer', AppFooter);

// Mount the app
app.mount('#app');
