/**
 * Project:   Orchea - Modular Documentation System
 * File:      vue-edit-document.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js application initialization for the document editing page.
 *   Handles document configuration editing and content management.
 *
 * License: MIT
 */

// Vue App for Edit Document Page
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            title: 'Edit Document - Orchea Documentation System'
        }
    }
});

// Register components
app.component('app-header', AppHeader);
app.component('edit-document-content', EditDocumentContent);
app.component('app-footer', AppFooter);

// Mount the app
app.mount('#app');
