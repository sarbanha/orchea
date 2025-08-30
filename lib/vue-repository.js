/**
 * Project:   Orchea - Modular Documentation System
 * File:      vue-repository.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js application initialization for the repository management page.
 *   Handles markdown file creation, editing, and repository operations.
 *
 * License: MIT
 */

// Main Vue.js Application
const { createApp } = Vue

const app = createApp({
    data() {
        return {
            appName: 'Orchea Documentation System'
        }
    }
})

// Register global components
app.component('app-header', AppHeader)
app.component('repository-manager', RepositoryManager)
app.component('app-footer', AppFooter)

// Mount the app
app.mount('#app')

console.log('🌺 Vue.js Orchea Documentation System initialized')
