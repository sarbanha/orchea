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
                    this.renderedContent = this.renderMarkdown(data.content)
                } else {
                    // Fallback: try to fetch README.md directly
                    const directResponse = await fetch('README.md')
                    if (directResponse.ok) {
                        const content = await directResponse.text()
                        this.renderedContent = this.renderMarkdown(content)
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
        },

        renderMarkdown(markdown) {
            let html = markdown

            // Headers
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

            // Bold and italic
            html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')

            // Code blocks
            html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            html = html.replace(/`([^`]*)`/gim, '<code>$1</code>')

            // Links
            html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>')

            // Lists
            html = html.replace(/^\d+\.\s(.*)$/gim, '<li>$1</li>')
            html = html.replace(/^-\s(.*)$/gim, '<li>$1</li>')
            
            // Wrap consecutive list items in ul/ol tags
            html = html.replace(/(<li>.*<\/li>)/gims, function(match) {
                // Simple heuristic: if we see numbered lists, use ol
                if (match.includes('1.') || match.includes('2.') || match.includes('3.')) {
                    return '<ol>' + match + '</ol>'
                } else {
                    return '<ul>' + match + '</ul>'
                }
            })

            // Blockquotes
            html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')

            // Paragraphs
            html = html.replace(/\n\n/gim, '</p><p>')
            html = '<p>' + html + '</p>'

            // Clean up empty paragraphs and fix nesting
            html = html.replace(/<p><\/p>/gim, '')
            html = html.replace(/<p>(<h[1-6]>)/gim, '$1')
            html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1')
            html = html.replace(/<p>(<pre>)/gim, '$1')
            html = html.replace(/(<\/pre>)<\/p>/gim, '$1')
            html = html.replace(/<p>(<ul>|<ol>)/gim, '$1')
            html = html.replace(/(<\/ul>|<\/ol>)<\/p>/gim, '$1')
            html = html.replace(/<p>(<blockquote>)/gim, '$1')
            html = html.replace(/(<\/blockquote>)<\/p>/gim, '$1')

            return html
        }
    }
}
