// DemoSection Vue Component
const DemoSection = {
    template: `
        <div class="demo-section">
            <h2>Try the Demo</h2>
            <p>Click below to view a sample document generated from Markdown snippets:</p>
            <a href="documents/sample-document/index.html" class="demo-button">View Sample Document</a>
            <a href="about.html" class="demo-button">About Orchea</a>
            
            <h2>How It Works</h2>
            <p>Each document directory contains:</p>
            <ul style="text-align: left; max-width: 600px; margin: 20px auto;">
                <li><strong>index.html</strong> - Loads JavaScript libraries and renders the document</li>
                <li><strong>config.yaml</strong> - Contains metadata and specifies which Markdown files to include</li>
            </ul>
            <p>The JavaScript code reads the YAML configuration, fetches the specified Markdown snippets from the repository, and renders them as a complete document.</p>
        </div>
    `
}
