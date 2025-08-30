// New Document Content Component
const NewDocumentContent = {
    template: `
        <div class="new-document-content">
            <!-- Header Section -->
            <section class="new-document-header">
                <h2><i class="fas fa-file-plus"></i> Create New Document</h2>
                <p>Create a new document by configuring its structure and selecting repository snippets to include.</p>
            </section>

            <!-- Document Configuration Form -->
            <section class="document-config-section">
                <div class="config-form-container">
                    <h3><i class="fas fa-cog"></i> Document Configuration</h3>
                    
                    <form @submit.prevent="createDocument" class="document-form">
                        <!-- Basic Information -->
                        <div class="form-section">
                            <h4>Basic Information</h4>
                            
                            <div class="form-group">
                                <label for="doc-name" class="form-label">Document Slug *</label>
                                <input 
                                    type="text" 
                                    id="doc-name" 
                                    v-model="documentConfig.name"
                                    class="form-input"
                                    placeholder="e.g., user-guide, api-docs, getting-started"
                                    maxlength="64"
                                    required
                                >
                                <small class="form-help">Use lowercase letters, numbers, and hyphens only. Maximum 64 characters.</small>
                            </div>

                            <div class="form-group">
                                <label for="doc-title" class="form-label">Document Title *</label>
                                <input 
                                    type="text" 
                                    id="doc-title" 
                                    v-model="documentConfig.title"
                                    class="form-input"
                                    placeholder="e.g., User Guide, API Documentation"
                                    required
                                >
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="doc-version" class="form-label">Version *</label>
                                    <input 
                                        type="text" 
                                        id="doc-version" 
                                        v-model="documentConfig.version"
                                        class="form-input"
                                        placeholder="1.0"
                                        required
                                    >
                                </div>

                                <div class="form-group">
                                    <label for="doc-date" class="form-label">Date *</label>
                                    <input 
                                        type="date" 
                                        id="doc-date" 
                                        v-model="documentConfig.date"
                                        class="form-input"
                                        required
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Content Selection -->
                        <div class="form-section">
                            <h4>Content Structure</h4>
                            <p class="section-description">Drag repository files to the selected files box to include them in your document:</p>
                            
                            <div class="content-selector">
                                <div class="available-files">
                                    <h5>Available Repository Files</h5>
                                    <div class="file-list-container">
                                        <div v-if="isLoadingFiles" class="loading-indicator">
                                            <i class="fas fa-spinner fa-spin"></i> Loading repository files...
                                        </div>
                                        <div v-else-if="availableFiles.length === 0" class="no-files">
                                            No markdown files found in repository
                                        </div>
                                        <div v-else-if="availableFilesFiltered.length === 0" class="no-files">
                                            All available files have been selected
                                        </div>
                                        <div v-else>
                                            <div 
                                                v-for="file in availableFilesFiltered" 
                                                :key="file"
                                                class="file-item-draggable file-pill"
                                                draggable="true"
                                                @dragstart="onDragStart($event, file)"
                                            >
                                                <span class="file-drag-handle"><i class="fas fa-grip-vertical"></i> </span>
                                                <span class="file-name">{{ file }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div 
                                    class="selected-files drop-zone"
                                    @dragover.prevent="onDragOver"
                                    @drop.prevent="onDrop"
                                    @dragleave="onDragLeave"
                                    :class="{ 'drag-over': isDragOver }"
                                >
                                    <h5>Selected Files ({{ documentConfig.markdown_files.length }})</h5>
                                    <div class="selected-list">
                                        <div v-if="documentConfig.markdown_files.length === 0" class="empty-selection">
                                            <i class="fas fa-inbox"></i> Drop files here or drag to reorder
                                        </div>
                                        <div v-else>
                                            <div 
                                                v-for="(file, index) in documentConfig.markdown_files" 
                                                :key="file"
                                                class="selected-file-item file-pill"
                                                draggable="true"
                                                @dragstart="onSelectedFileDragStart($event, index)"
                                                @dragover.prevent
                                                @drop.prevent="onSelectedFileDrop($event, index)"
                                            >
                                                <span class="file-drag-handle"><i class="fas fa-grip-vertical"></i> </span>
                                                <span class="file-name">{{ file }}</span>
                                                <button 
                                                    type="button"
                                                    @click="removeFile(file)"
                                                    class="remove-file-btn"
                                                    title="Remove file"
                                                >
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="form-actions">
                            <button 
                                type="submit" 
                                class="btn btn-primary"
                                :disabled="!isFormValid || isCreating"
                            >
                                <i v-if="isCreating" class="fas fa-spinner fa-spin"></i>
                                <i v-else class="fas fa-check"></i>
                                {{ isCreating ? ' Creating Document...' : ' Create Document' }}
                            </button>
                            
                            <button 
                                type="button" 
                                class="btn btn-outline"
                                @click="resetForm"
                            >
                                <i class="fas fa-undo"></i> Reset Form
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Success/Error Messages -->
            <div v-if="message" 
                 :class="['message', messageType]">
                {{ message }}
            </div>
        </div>
    `,
    data() {
        return {
            documentConfig: {
                name: '',
                title: '',
                version: '1.0',
                date: new Date().toISOString().split('T')[0],
                markdown_files: []
            },
            availableFiles: [],
            isLoadingFiles: false,
            isCreating: false,
            showPreview: false,
            message: '',
            messageType: 'success',
            isDragOver: false,
            draggedFileIndex: null
        }
    },
    computed: {
        isFormValid() {
            return this.documentConfig.name.trim() !== '' && 
                   this.documentConfig.title.trim() !== '' &&
                   this.documentConfig.version.trim() !== '' &&
                   this.documentConfig.date.trim() !== '' &&
                   this.documentConfig.markdown_files.length > 0
        },
        
        availableFilesFiltered() {
            return this.availableFiles.filter(file => !this.isFileSelected(file))
        }
    },
    async mounted() {
        await this.loadAvailableFiles()
    },
    methods: {
        async loadAvailableFiles() {
            this.isLoadingFiles = true
            try {
                let availableFiles = []
                
                // Try to get files from API first
                try {
                    const apiResponse = await fetch('/api/files')
                    if (apiResponse.ok) {
                        const data = await apiResponse.json()
                        availableFiles = data.files || []
                        console.log('Loaded files from API:', availableFiles)
                    } else {
                        throw new Error('API not available')
                    }
                } catch (apiError) {
                    console.log('API not available, scanning for common files...')
                    
                    // Fallback: check for common repository files
                    const commonFiles = [
                        'intro.md',
                        'getting-started.md',
                        'configuration.md',
                        'conclusion.md',
                        'installation.md',
                        'usage.md',
                        'api.md',
                        'examples.md',
                        'troubleshooting.md',
                        'faq.md',
                        'readme.md',
                        'overview.md',
                        'setup.md',
                        'deployment.md',
                        'features.md',
                        'architecture.md'
                    ]
                    
                    for (const file of commonFiles) {
                        try {
                            const response = await fetch(`repository/${file}`)
                            if (response.ok) {
                                availableFiles.push(file)
                            }
                        } catch (error) {
                            // File doesn't exist, skip it
                            continue
                        }
                    }
                }
                
                this.availableFiles = availableFiles.filter(file => file.endsWith('.md'))
                
                if (this.availableFiles.length === 0) {
                    this.showMessage('No markdown files found in repository. You can still create a document configuration.', 'info')
                } else {
                    console.log(`Found ${this.availableFiles.length} available files:`, this.availableFiles)
                }
                
            } catch (error) {
                console.error('Error loading files:', error)
                this.showMessage('Error loading repository files: ' + error.message, 'error')
            } finally {
                this.isLoadingFiles = false
            }
        },

        async refreshAvailableFiles() {
            this.showMessage('Refreshing file list...', 'info')
            await this.loadAvailableFiles()
            this.showMessage(`Refreshed! Found ${this.availableFiles.length} available files.`, 'success')
        },

        // Drag and Drop Methods
        onDragStart(event, filename) {
            event.dataTransfer.setData('text/plain', filename)
            event.dataTransfer.effectAllowed = 'copy'
        },

        onDragOver(event) {
            event.preventDefault()
            this.isDragOver = true
        },

        onDragLeave(event) {
            // Only reset isDragOver if we're leaving the entire drop zone
            if (!event.currentTarget.contains(event.relatedTarget)) {
                this.isDragOver = false
            }
        },

        onDrop(event) {
            event.preventDefault()
            this.isDragOver = false
            
            const filename = event.dataTransfer.getData('text/plain')
            if (filename && !this.isFileSelected(filename)) {
                this.documentConfig.markdown_files.push(filename)
            }
        },

        onSelectedFileDragStart(event, index) {
            this.draggedFileIndex = index
            event.dataTransfer.effectAllowed = 'move'
        },

        onSelectedFileDrop(event, targetIndex) {
            event.preventDefault()
            
            if (this.draggedFileIndex !== null && this.draggedFileIndex !== targetIndex) {
                const files = [...this.documentConfig.markdown_files]
                const draggedFile = files[this.draggedFileIndex]
                
                // Remove from old position
                files.splice(this.draggedFileIndex, 1)
                
                // Insert at new position
                const newIndex = this.draggedFileIndex < targetIndex ? targetIndex - 1 : targetIndex
                files.splice(newIndex, 0, draggedFile)
                
                this.documentConfig.markdown_files = files
            }
            
            this.draggedFileIndex = null
        },

        isFileSelected(filename) {
            return this.documentConfig.markdown_files.includes(filename)
        },

        removeFile(filename) {
            const index = this.documentConfig.markdown_files.indexOf(filename)
            if (index !== -1) {
                this.documentConfig.markdown_files.splice(index, 1)
            }
        },

        generateYAMLPreview() {
            let yaml = ''
            
            if (this.documentConfig.title) {
                yaml += `document_title: "${this.documentConfig.title}"\n`
            }
            
            yaml += `version: "${this.documentConfig.version}"\n`
            yaml += `date: "${this.documentConfig.date}"\n`
            yaml += `markdown_files:\n`
            
            for (const file of this.documentConfig.markdown_files) {
                yaml += `  - ${file}\n`
            }
            
            return yaml
        },

        previewConfiguration() {
            this.showPreview = true
        },

        // Utility function to convert text to kebab-case
        convertToKebabCase(text) {
            return text
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
                .substring(0, 64) // Limit to 64 characters
        },

        async createDocument() {
            if (!this.isFormValid) {
                this.showMessage('Please fill in all required fields and select at least one file.', 'error')
                return
            }

            this.isCreating = true
            
            try {
                // Convert slug to kebab-case format
                const kebabSlug = this.convertToKebabCase(this.documentConfig.name)
                
                // Prepare document data for API
                const documentData = {
                    slug: kebabSlug,
                    title: this.documentConfig.title,
                    version: this.documentConfig.version,
                    date: this.documentConfig.date,
                    markdown_files: this.documentConfig.markdown_files
                }
                
                console.log('Creating document with kebab-case slug:', kebabSlug)
                console.log('Document data:', documentData)
                
                // Call the API to create the document
                const response = await fetch('/api/documents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(documentData)
                })
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers.get('content-type'));
                
                // Check if response is actually JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const textResponse = await response.text();
                    console.error('Expected JSON but got:', textResponse);
                    throw new Error('Server returned non-JSON response: ' + textResponse.substring(0, 100));
                }
                
                const result = await response.json()
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to create document')
                }
                
                if (result.success) {
                    this.showMessage(
                        `Document created successfully!\n\n` +
                        `Directory: ${result.path}/\n` +
                        `Files: ${result.files.join(', ')}\n` +
                        `View at: ${result.path}/index.html`, 
                        'success'
                    )
                    
                    // Redirect to documents page after creation
                    setTimeout(() => {
                        window.location.href = 'documents.html'
                    }, 3000)
                } else {
                    throw new Error(result.message || 'Failed to create document')
                }
                
            } catch (error) {
                console.error('Error creating document:', error)
                this.showMessage('Error creating document: ' + error.message, 'error')
            } finally {
                this.isCreating = false
            }
        },

        generateIndexHtml(slug) {
            const title = this.documentConfig.title || 'Document'
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Orchea Documentation System</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }

        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }

        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .metadata {
            background: #f8f9fa;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 0.9em;
            color: #6c757d;
            text-align: center;
            margin-bottom: 20px;
        }

        .content h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }

        .content h2 {
            color: #34495e;
            margin-top: 30px;
        }

        .content h3 {
            color: #7f8c8d;
        }

        .content code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }

        .content pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }

        .content pre code {
            background: none;
            padding: 0;
            color: #ecf0f1;
        }

        .content ul, .content ol {
            margin: 15px 0;
            padding-left: 30px;
        }

        .content li {
            margin: 5px 0;
        }

        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #f5c6cb;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #6c757d;
        }

        .loading::after {
            content: '';
            animation: loading 1.5s infinite;
        }

        @keyframes loading {
            0%, 50% { content: 'Loading'; }
            60% { content: 'Loading.'; }
            70% { content: 'Loading..'; }
            80%, 100% { content: 'Loading...'; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Orchea Documentation System</h1>
            <div id="metadata"></div>
        </div>
        
        <div id="content" class="content">
            <div class="loading">Loading</div>
        </div>
    </div>

    <!-- Load JavaScript libraries -->
    <script src="../../lib/yaml-parser.js"></script>
    <script src="../../lib/markdown-renderer.js"></script>
    <script src="../../lib/document-builder.js"></script>

    <script>
        // Initialize and render the document
        document.addEventListener('DOMContentLoaded', async function() {
            const builder = new DocumentBuilder();
            await builder.renderDocument('./config.yaml', 'content');
        });
    </script>
</body>
</html>`
        },

        resetForm() {
            this.documentConfig = {
                name: '',
                title: '',
                version: '1.0',
                date: new Date().toISOString().split('T')[0],
                markdown_files: []
            }
            this.showPreview = false
            this.clearMessage()
        },

        showMessage(text, type = 'success') {
            this.message = text
            this.messageType = type
            setTimeout(() => {
                this.clearMessage()
            }, 5000)
        },

        clearMessage() {
            this.message = ''
        }
    }
}
