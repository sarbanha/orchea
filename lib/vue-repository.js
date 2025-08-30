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

// Mount the app
app.mount('#app')

console.log('🌺 Vue.js Orchea Documentation System initialized')
