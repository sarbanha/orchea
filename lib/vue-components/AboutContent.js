// AboutContent Vue Component
const AboutContent = {
    template: `
        <div class="content-section">
            <div v-if="isLoading" class="loading">
                Loading documentation...
            </div>
            <div v-else-if="error" class="error">
                <h2>Error Loading Documentation</h2>
                <p>Could not load README.md: {{ error }}</p>
                <p>Please make sure the README.md file exists in the root directory.</p>
            </div>
            <div v-else v-html="renderedContent"></div>
        </div>
    `,
    data() {
        return {
            isLoading: true,
            error: null,
            renderedContent: ''
        }
    },
    async mounted() {
        await this.loadReadme()
    },
    methods: {
        async loadReadme() {
            try {
                // Try to load from API first (when server is running)
                const response = await fetch('/api/files/README.md')
                if (response.ok) {
                    const data = await response.json()
                    this.renderedContent = marked.parse(data.content)
                } else {
                    // Fallback: try to fetch README.md directly
                    const directResponse = await fetch('README.md')
                    if (directResponse.ok) {
                        const content = await directResponse.text()
                        this.renderedContent = marked.parse(content)
                    } else {
                        throw new Error('README.md not found')
                    }
                }
            } catch (error) {
                console.error('Error loading README:', error)
                // Provide default content if README.md cannot be loaded
                this.renderedContent = `
                    <h1>About Orchea</h1>
                    <p>Orchea is a modular documentation system built with Vue.js and Node.js.</p>
                    <p><em>Note: Could not load README.md file. Please make sure the server is running or the README.md file exists.</em></p>
                    <h2>Features</h2>
                    <ul>
                        <li>Markdown file management</li>
                        <li>Real-time editing</li>
                        <li>Modern Vue.js components</li>
                        <li>Responsive design</li>
                    </ul>
                    <h2>Technology Stack</h2>
                    <ul>
                        <li>Vue.js 3</li>
                        <li>Node.js & Express.js</li>
                        <li>Modern CSS</li>
                    </ul>
                `
            } finally {
                this.isLoading = false
            }
        }
    }
}
