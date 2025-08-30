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
