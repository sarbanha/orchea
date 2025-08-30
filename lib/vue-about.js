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
