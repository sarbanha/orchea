# Orchea - Modular Documentation System

A JavaScript web application for creating documents from modular Markdown snippets with YAML-based configuration.

## Directory Structure

```
Orchea/
├── repository/          # Markdown text snippets
│   ├── intro.md
│   ├── getting-started.md
│   ├── configuration.md
│   └── conclusion.md
├── lib/                 # JavaScript libraries
│   ├── yaml-parser.js
│   ├── markdown-renderer.js
│   └── document-builder.js
├── documents/           # Document directories
│   └── sample-document/
│       ├── index.html   # Document viewer
│       └── config.yaml  # Document configuration
└── index.html          # Main landing page
```

## Features

- **Modular Content**: Store reusable Markdown snippets in the `repository` directory
- **YAML Configuration**: Each document uses a YAML file to specify metadata and content order
- **Dynamic Assembly**: JavaScript code automatically fetches and combines snippets
- **Beautiful Rendering**: Custom Markdown renderer with responsive design
- **Version Control**: Track document versions and dates through YAML metadata

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Running

1. **Clone or download** the Orchea project
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Open your browser** to `http://localhost:3000`

That's it! The Node.js server provides:
- 🌐 **Web application** serving (static files + API)
- 💾 **Persistent file editing** 
- 🔒 **Secure file operations**
- 📝 **Full CRUD** for Markdown files

## How to Use

### Managing Markdown Files
1. **View Repository**: The main page shows all Markdown files in the left panel
2. **Preview Files**: Click any filename to see a rendered preview
3. **Edit Files**: Click the ✏️ edit button to modify content
4. **Save Changes**: Click 💾 Save to persist changes to disk

### Creating Documents
1. **Create a document directory**: `mkdir documents/my-document`
2. **Add configuration**: Create `config.yaml` with metadata and file list
3. **Create viewer**: Add `index.html` that loads the libraries
4. **View document**: Open the HTML file to see your assembled document

### Example Document Configuration
```yaml
version: "1.0"
date: "2025-08-29"
markdown_files:
  - intro.md
  - section1.md
  - conclusion.md
```

## Development

## License

MIT License - feel free to use and modify as needed.
