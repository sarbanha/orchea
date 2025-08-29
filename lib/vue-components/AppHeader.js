// AppHeader Vue Component
const AppHeader = {
    props: {
        activePage: {
            type: String,
            default: 'repository'
        }
    },
    template: `
        <div class="header">
            <h1>Orchea</h1>
            <p>Modular Documentation System</p>
            
            <div class="menu-bar">
                <nav class="menu-nav">
                    <a href="index.html" :class="['menu-item', { active: activePage === 'repository' }]">Repository</a>
                    <span class="menu-separator">|</span>
                    <a href="about.html" :class="['menu-item', { active: activePage === 'about' }]">About</a>
                </nav>
            </div>
        </div>
    `
}
