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
