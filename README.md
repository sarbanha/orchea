# Orchea - Modular Documentation System

A modern Vue.js web application for creating and managing do4. **Save changes**: Click "Update Document" to apply modifications

### **Managing Content**

1. **Repository Management**:ts from modular Markdown snippets with YAML-based configuration. Build professional documentation by combining reusable content blocks through an intuitive web interface.

## Directory Structure

```
Orchea/
├── templates/             # Document templates
│   └── document-index.html # Master template for documents
└── documents/            # Generated document directories
    └── sample-document/
        ├── index.html    # Document viewer (auto-generated)
        └── config.yaml   # Document configuration
```

## Core Features

### **Document Management**
- **Create Documents**: Visual interface for assembling documents from repository files
- **Edit Documents**: Modify document configuration, content selection, and metadata
- **Delete Documents**: Remove documents with confirmation dialogs
- **Browse Documents**: View all documents with search and filtering capabilities
- **Download Markdown**: Export complete documents as combined Markdown files

### **Content Management**
- **Repository Browser**: Manage all Markdown files in a centralized repository
- **File Editor**: Built-in editor for creating and modifying Markdown content
- **Drag & Drop**: Intuitive interface for selecting and ordering document content
- **Real-time Preview**: Live preview of Markdown content as you type
- **File Operations**: Create, edit, save, and delete Markdown files

### **Configuration System**
- **YAML-based**: Simple YAML configuration for document metadata
- **Template Engine**: Centralized template system for consistent document styling
- **Version Control**: Track document versions and publication dates
- **Metadata Management**: Document titles, versions, dates, and file lists

### **Modern Interface**
- **Vue.js Frontend**: Reactive, component-based user interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional Styling**: Clean, modern design with gradient themes
- **Drag & Drop UI**: Visual content selection and reordering
- **Loading States**: Clear feedback during operations

### **Backend API**
- **Node.js Server**: Full-featured backend with RESTful API
- **File Operations**: Secure file reading, writing, and management
- **Document CRUD**: Complete Create, Read, Update, Delete operations
- **Template Processing**: Dynamic template rendering and variable substitution
- **Error Handling**: Comprehensive error reporting and validation

## Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone or download** the Orchea project
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm start
   ```
4. **Open your browser** to `http://localhost:3000`

The Node.js server provides:
- **Web application serving** (static files + Vue.js frontend)
- **Persistent file operations** with real-time updates
- **Secure API endpoints** with validation and error handling
- **Full CRUD operations** for documents and Markdown files
- **Template processing** for consistent document styling

## How to Use

### **Creating Your First Document**

1. **Navigate to "New Document"** from the main menu
2. **Fill in document details**:
   - Document title (e.g., "User Guide")
   - Version number (e.g., "1.0")
   - Publication date
3. **Select content files**:
   - Drag Markdown files from "Available Files" to "Selected Files"
   - Reorder files by dragging within the selected area
4. **Create document**: Click "Create Document" to generate your documentation

### **Editing Documents**

1. **Browse documents** on the Documents page
2. **Click "Edit Configuration"** for any document
3. **Modify settings**:
   - Update title, version, or date
   - Add or remove Markdown files
   - Reorder content sections
4. **Save changes**: Click "Update Document" to apply modifications

### � **Managing Content**

1. **Repository Management**:
   - Visit the Repository page to manage Markdown files
   - Create new files with the built-in editor
   - Edit existing content with live preview
   - Delete unused files (with confirmation)

2. **File Organization**:
   - Keep related content in focused Markdown files
   - Use descriptive filenames (e.g., `installation-guide.md`)
   - Maintain consistent formatting across files

### **Viewing Documents**

1. **Document Browser**: View all documents with metadata on the Documents page
2. **Inline Preview**: See document content directly in the browser interface
3. **Full Document**: Open complete documents in new tabs for presentation
4. **Download**: Export documents as combined Markdown files for external use

## Document Configuration

### YAML Structure
Each document uses a `config.yaml` file for configuration:

```yaml
document_title: "My Documentation"
version: "2.1.0"
date: "2025-08-30"
markdown_files:
  - intro.md
  - installation.md
  - configuration.md
  - troubleshooting.md
  - conclusion.md
```

### Template System
Documents are generated from a master template (`templates/document-index.html`) featuring:
- Clean, professional styling
- Responsive design for all devices
- Automatic version and date display
- Consistent formatting across all documents
- Dynamic content loading from YAML configuration

## API Endpoints

### Document Operations
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:slug/config` - Get document configuration
- `PUT /api/documents/:slug/update` - Update document configuration
- `DELETE /api/documents/:slug` - Delete document

### File Operations
- `GET /api/files` - List repository files
- `GET /api/files/:filename` - Get file content
- `PUT /api/files/:filename` - Update file content
- `POST /api/files` - Create new file
- `DELETE /api/files/:filename` - Delete file

## Development

### Architecture
- **Frontend**: Vue.js 3 with component-based architecture
- **Backend**: Node.js with Express.js for API services
- **Styling**: Custom CSS with modern design principles
- **Data**: File-based storage with YAML configuration

### Key Components
- **AppHeader**: Navigation and branding
- **NewDocumentContent**: Document creation interface
- **EditDocumentContent**: Document modification interface
- **DocumentsContent**: Document browsing and viewing
- **RepositoryManager**: File management and editing

### Customization
- **Templates**: Modify `templates/document-index.html` for custom document styling
- **Styling**: Update `css/style.css` for interface customization
- **Components**: Extend Vue.js components for additional functionality

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your branch: `git push origin feature-name`
6. Submit a pull request with detailed description

## License

MIT License - feel free to use and modify as needed.
