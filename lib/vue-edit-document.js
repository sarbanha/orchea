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
