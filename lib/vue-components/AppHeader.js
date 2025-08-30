/**
 * Project:   Orchea - Modular Documentation System
 * File:      AppHeader.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Universal header component with navigation menu and branding.
 *   Handles active page highlighting and responsive navigation.
 *
 * License: MIT
 */

// AppHeader Vue Component
const AppHeader = {
    props: {
        activePage: {
            type: String,
            default: 'home'
        }
    },
    template: `
        <div class="header">
            <div class="header-brand">
                <div class="logo">🌿</div>
                <div class="brand-text">
                    <h1>Orchea</h1>
                    <p>Modular Documentation System</p>
                </div>
            </div>
            
            <div class="menu-bar">
                <nav class="menu-nav">
                    <a href="index.html" :class="['menu-item', { active: activePage === 'home' }]">Home</a>
                    <span class="menu-separator">|</span>
                    <a href="new-document.html" :class="['menu-item', { active: activePage === 'new-document' }]">New Document</a>
                    <span class="menu-separator">|</span>
                    <a href="documents.html" :class="['menu-item', { active: activePage === 'documents' }]">Documents</a>
                    <span class="menu-separator">|</span>
                    <a href="repository.html" :class="['menu-item', { active: activePage === 'repository' }]">Repository</a>
                    <span class="menu-separator">|</span>
                    <a href="about.html" :class="['menu-item', { active: activePage === 'about' }]">About</a>
                </nav>
            </div>
        </div>
    `
}
