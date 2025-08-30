/**
 * Project:   Orchea - Modular Documentation System
 * File:      HomepageContent.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Homepage hero section component with project introduction and navigation.
 *   Features streamlined design with call-to-action buttons.
 *
 * License: MIT
 */

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
        </div>
    `
}
