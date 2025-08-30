/**
 * Project:   Orchea - Modular Documentation System
 * File:      vue-about.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js application initialization for the about page.
 *   Handles AboutContent component registration and app mounting.
 *
 * License: MIT
 */

// Vue.js About Page Application
const { createApp } = Vue

const app = createApp({
    data() {
        return {
            pageTitle: 'About Orchea'
        }
    }
})

// Register components
app.component('app-header', AppHeader)
app.component('about-content', AboutContent)
app.component('app-footer', AppFooter)

// Mount the app
app.mount('#app')

console.log('🌺 Vue.js About Page initialized')
