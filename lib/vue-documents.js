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
