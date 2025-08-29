/**
 * Document Builder - Main class for building documents from Markdown snippets
 */
class DocumentBuilder {
    constructor() {
        this.repositoryPath = '../../repository/';
        this.config = null;
    }

    async loadConfig(configPath) {
        try {
            const response = await fetch(configPath);
            const yamlText = await response.text();
            this.config = YAMLParser.parse(yamlText);
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            throw error;
        }
    }

    async loadMarkdownFile(filename) {
        try {
            const response = await fetch(this.repositoryPath + filename);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Error loading markdown file ${filename}:`, error);
            return `# Error\n\nCould not load file: ${filename}`;
        }
    }

    async buildDocument() {
        if (!this.config) {
            throw new Error('Config not loaded. Call loadConfig() first.');
        }

        const markdownFiles = this.config.markdown_files || [];
        let combinedMarkdown = '';

        for (const filename of markdownFiles) {
            const content = await this.loadMarkdownFile(filename);
            combinedMarkdown += content + '\n\n';
        }

        return MarkdownRenderer.render(combinedMarkdown);
    }

    async renderDocument(configPath, targetElementId) {
        try {
            await this.loadConfig(configPath);
            const html = await this.buildDocument();
            
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = html;
                
                // Display metadata
                this.displayMetadata();
            } else {
                console.error(`Target element ${targetElementId} not found`);
            }
        } catch (error) {
            console.error('Error rendering document:', error);
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = `<div class="error">
                    <h2>Error Loading Document</h2>
                    <p>${error.message}</p>
                </div>`;
            }
        }
    }

    displayMetadata() {
        if (!this.config) return;

        const metadataElement = document.getElementById('metadata');
        if (metadataElement && this.config) {
            metadataElement.innerHTML = `
                <div class="metadata">
                    <strong>Version:</strong> ${this.config.version || 'N/A'} | 
                    <strong>Date:</strong> ${this.config.date || 'N/A'}
                </div>
            `;
        }
    }
}
