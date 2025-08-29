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

// Mount the app
app.mount('#app');
