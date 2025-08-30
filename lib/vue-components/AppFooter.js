/**
 * Project:   Orchea - Modular Documentation System
 * File:      AppFooter.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Minimalist footer component with project attribution and social links.
 *   Provides consistent footer across all application pages.
 *
 * License: MIT
 */

// App Footer Component
const AppFooter = {
    template: `
        <footer class="app-footer">
            <div class="footer-content">
                <div class="footer-copyright">
                    <p>
                        &copy; {{ currentYear }} Orchea Documentation System. 
                        Built with <i class="fas fa-heart" style="color: #e74c3c;"></i> by 
                        <a href="https://github.com/sarbanha" target="_blank" class="footer-link">
                            <i class="fab fa-github"></i> Martin A. Sarbanha
                        </a>
                        |
                        <a href="https://linkedin.com/in/sarbanha" target="_blank" class="footer-link">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    `,
    data() {
        return {
            currentYear: new Date().getFullYear()
        }
    }
}
