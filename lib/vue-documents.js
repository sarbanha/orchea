/**
 * Project:   Orchea - Modular Documentation System
 * File:      vue-documents.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js application initialization for the documents page.
 *   Manages document listing, viewing, and content assembly functionality.
 *
 * License: MIT
 */

// Vue App for Documents Page
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            title: 'Documents - Orchea Documentation System'
        }
    }
});

// Register components
app.component('app-header', AppHeader);
app.component('documents-content', DocumentsContent);
app.component('app-footer', AppFooter);

// Mount the app
app.mount('#app');
