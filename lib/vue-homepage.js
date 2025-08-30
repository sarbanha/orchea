// Vue App for Homepage
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            title: 'Orchea - Modular Documentation System'
        }
    }
});

// Register components
app.component('app-header', AppHeader);
app.component('homepage-content', HomepageContent);
app.component('app-footer', AppFooter);

// Mount the app
app.mount('#app');
