// Homepage Content Component
const HomepageContent = {
    template: `
        <div class="homepage-content">
            <section class="hero-section">
                <div class="hero-content">
                    <h1 class="hero-title">Orchea</h1>
                    <p class="hero-subtitle">Modular Documentation System</p>
                    <p class="hero-description">
                        Create beautiful documents from modular Markdown snippets with YAML-based configuration.
                        Build, organize, and maintain your documentation with ease.
                    </p>
                    <div class="hero-actions">
                        <a href="documents.html" class="btn btn-primary">View Documents</a>
                        <a href="repository.html" class="btn btn-secondary">Explore Repository</a>
                        <a href="about.html" class="btn btn-secondary">Learn More</a>
                    </div>
                </div>
            </section>

            <section class="features-section">
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <h3>Modular Content</h3>
                        <p>Store reusable Markdown snippets in the repository directory for maximum flexibility and reusability.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚙️</div>
                        <h3>YAML Configuration</h3>
                        <p>Use YAML files to specify document metadata, content order, and structure with simple configuration.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔧</div>
                        <h3>Dynamic Assembly</h3>
                        <p>JavaScript automatically fetches and combines snippets to create complete documents on demand.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <h3>Beautiful Rendering</h3>
                        <p>Custom Markdown renderer with responsive design ensures your content looks great on any device.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Version Control</h3>
                        <p>Track document versions, dates, and changes through comprehensive YAML metadata.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <h3>Easy to Use</h3>
                        <p>Simple setup with Node.js and npm. Get started with your documentation in minutes.</p>
                    </div>
                </div>
            </section>

            <section class="quick-start-section">
                <div class="quick-start-content">
                    <h2>Quick Start</h2>
                    <div class="steps-grid">
                        <div class="step">
                            <div class="step-number">1</div>
                            <h4>Install Dependencies</h4>
                            <code>npm install</code>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <h4>Start the Server</h4>
                            <code>npm start</code>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <h4>Open Browser</h4>
                            <code>http://localhost:3000</code>
                        </div>
                    </div>
                    <p class="quick-start-note">
                        Ready to start? Browse existing <a href="documents.html">documents</a>, explore the 
                        <a href="repository.html">repository</a>, or check out our <a href="about.html">documentation</a>.
                    </p>
                </div>
            </section>
        </div>
    `
}
