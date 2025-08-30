/**
 * Project:   Orchea - Modular Documentation System
 * File:      vue-new-document.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js application initialization for the new document creation page.
 *   Handles document configuration, file selection, and creation workflow.
 *
 * License: MIT
 */

// Vue App for New Document Page
const { createApp } = Vue

const app = createApp({
    components: {
        AppHeader,
        NewDocumentContent,
        AppFooter
    }
})

app.mount('#app')
