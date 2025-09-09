/**
 * Project:   Orchea - Modular Documentation System
 * File:      EditDocumentContent.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js component for editing existing documents. Handles document loading,
 *   configuration modification, file selection, and document updates/deletion.
 *
 * License: MIT
 */

// Edit Document Content Component
const EditDocumentContent = {
    template: `
        <div class="new-document-content" id="edit-document-content">
            <!-- Header Section -->
            <section class="new-document-header">
                <h2><i class="fas fa-edit"></i> Edit Document</h2>
                <p>Modify an existing document's configuration and structure by selecting repository snippets to include.</p>
            </section>

            <!-- No Document Loaded Message -->
            <section class="document-config-section" v-if="!selectedDocumentSlug && !isLoadingDocuments">
                <div class="config-form-container">
                    <div class="no-document-message">
                        <h3><i class="fas fa-file-alt"></i> No Document Selected</h3>
                        <p>To edit a document, please access this page with a document parameter:</p>
                        <code>edit-document.html?doc=your-document-slug</code>
                        <br><br>
                        <a href="documents.html" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Browse Documents</a>
                    </div>
                </div>
            </section>

            <!-- Document Configuration Form -->
            <section class="document-config-section" v-if="selectedDocumentSlug">
                <div class="config-form-container">
                    <div class="document-header-info">
                        <h3><i class="fas fa-edit"></i> Editing: {{ documentConfig.title }}</h3>
                        <div class="document-meta">
                            <span class="meta-badge"><i class="fas fa-folder"></i> {{ selectedDocumentSlug }}</span>
                            <span class="meta-badge"><i class="fas fa-calendar"></i> {{ documentConfig.date }}</span>
                            <span class="meta-badge"><i class="fas fa-tag"></i> v{{ documentConfig.version }}</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                            <i class="fas fa-arrow-left"></i> Back to Documents
                        </button>
                    </div>
                    
                    <form @submit.prevent="updateDocument" class="document-form">
                        <!-- Basic Information -->
                        <div class="form-section">
                            <h4>Basic Information</h4>
                            
                            <div class="form-group">
                                <label for="doc-slug" class="form-label">Document Slug</label>
                                <input 
                                    type="text" 
                                    id="doc-slug" 
                                    v-model="documentConfig.slug"
                                    class="form-input"
                                    disabled
                                    title="Document slug cannot be changed after creation"
                                >
                                <small class="form-help">Document slug cannot be changed after creation.</small>
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
                                        placeholder="e.g., 1.0, 2.1.3"
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
                            <p class="section-description">Click on repository files to select/deselect them for your document:</p>
                            
                            <div class="content-selection-grid">
                                <div class="file-selection-panel">
                                    <div class="panel-header">
                                        Available Repository Files
                                        <span class="file-count">{{ availableFiles.length }} files</span>
                                    </div>
                                    <div class="file-selection-list">
                                        <div v-if="isLoadingFiles" class="loading-indicator">
                                            <i class="fas fa-spinner fa-spin"></i> Loading repository files...
                                        </div>
                                        <div v-else-if="availableFiles.length === 0" class="no-files">
                                            <i class="fas fa-folder-open"></i>
                                            <p>No markdown files found in repository</p>
                                        </div>
                                        <div v-else>
                                            <div 
                                                v-for="file in availableFiles" 
                                                :key="file"
                                                class="file-selection-item"
                                                :class="{ 'selected': isFileSelected(file) }"
                                                @click="previewFileOnly(file)"
                                                @dblclick="toggleFileSelection(file)"
                                            >
                                                <span class="file-checkbox-icon" :class="{ 'selected': isFileSelected(file), 'unselected': !isFileSelected(file) }">
                                                    <i v-if="isFileSelected(file)" class="fas fa-check-square" style="color: #28a745;"></i>
                                                    <i v-else class="far fa-square" style="color: #dee2e6;"></i>
                                                </span>
                                                <span class="file-name-display">{{ getFileTitle(file) }}</span>
                                                <span v-if="isFileSelected(file)" class="file-order">#{{ getFileOrder(file) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="file-preview-panel">
                                    <div class="panel-header">
                                        File Preview
                                        <span v-if="lastSelectedFile" class="file-count">
                                            Position #{{ getFileOrder(lastSelectedFile) }}
                                        </span>
                                    </div>
                                    <div class="file-preview-content">
                                        <div v-if="!lastSelectedFile" class="no-preview">
                                            <i class="fas fa-file-alt"></i>
                                            <p>Select a file to preview its content</p>
                                        </div>
                                        <div v-else-if="isLoadingPreview" class="loading-preview">
                                            <i class="fas fa-spinner fa-spin"></i>
                                            Loading preview for {{ lastSelectedFile }}...
                                        </div>
                                        <div v-else>
                                            <div class="preview-header">
                                                <div class="preview-file-name">{{ lastSelectedFile }}</div>
                                                <div class="preview-position">{{ getFileOrder(lastSelectedFile) }} of {{ documentConfig.markdown_files.length }}</div>
                                            </div>
                                            <div class="preview-markdown" v-html="currentFilePreview"></div>
                                            
                                            <!-- File Label Information -->
                                            <div v-if="lastSelectedFile && fileConfigs[lastSelectedFile]" class="file-label-info">
                                                <div class="label-display">
                                                    <i class="fas fa-tag"></i>
                                                    <span class="label-text">{{ fileConfigs[lastSelectedFile].label }}</span>
                                                    <span class="last-update">
                                                        <i class="fas fa-clock"></i>
                                                        Last updated: {{ formatDate(fileConfigs[lastSelectedFile].lastUpdate) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Selected Files Summary -->
                            <div class="selected-files-summary" v-if="documentConfig.markdown_files.length > 0">
                                <h4>Selected Files ({{ documentConfig.markdown_files.length }})</h4>
                                <div class="selected-file-tags" :class="{ 'is-dragging': isDragging }">
                                    <button 
                                        v-for="(file, index) in documentConfig.markdown_files" 
                                        :key="file + '-' + index"
                                        class="selected-file-tag"
                                        :class="{ 'dragging': draggedFileIndex === index }"
                                        draggable="true"
                                        @click="previewFile(file)"
                                        @dragstart="onTagDragStart($event, index)"
                                        @dragend="onTagDragEnd"
                                        @dragover.prevent="onTagDragOver($event, index)"
                                        @drop.prevent="onTagDrop($event, index)"
                                    >
                                        <i class="fas fa-grip-vertical drag-handle"></i>
                                        #{{ index + 1 }} {{ file }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Final Document Preview -->
                        <div class="form-section" v-if="documentConfig.markdown_files.length > 0">
                            <div class="final-preview-section">
                                <div class="final-preview-header">
                                    Final Document: {{ documentConfig.title }}
                                </div>
                                <div class="final-preview-content">
                                    <div v-if="isLoadingFinalPreview" class="loading-final-preview">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        Generating final document preview...
                                    </div>
                                    <div v-else-if="!finalDocumentPreview" class="no-final-preview">
                                        <i class="fas fa-file-alt"></i>
                                        <p>No content to preview</p>
                                    </div>
                                    <div v-else class="final-preview-markdown" v-html="finalDocumentPreview"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="form-actions">
                            <div class="form-actions-left">
                                <button 
                                    type="submit" 
                                    class="btn btn-primary btn-lg"
                                    :disabled="!isFormValid || isUpdating"
                                    :class="{ 'btn-loading': isUpdating }"
                                >
                                    <span v-if="isUpdating"><i class="fas fa-sync fa-spin"></i> Updating Document...</span>
                                    <span v-else><i class="fas fa-save"></i> Update Document</span>
                                </button>
                                
                                <button 
                                    type="button" 
                                    class="btn btn-secondary btn-lg"
                                    @click="cancelEdit"
                                    :disabled="isUpdating"
                                >
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            </div>
                            
                            <div class="form-actions-right">
                                <button 
                                    type="button" 
                                    class="btn btn-danger btn-lg"
                                    @click="confirmDeleteDocument"
                                    :disabled="isUpdating || isDeleting"
                                    :class="{ 'btn-loading': isDeleting }"
                                >
                                    <span v-if="isDeleting"><i class="fas fa-trash fa-spin"></i> Deleting...</span>
                                    <span v-else><i class="fas fa-trash"></i> Delete Document</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Status Messages -->
            <div v-if="statusMessage" 
                 class="status-message" 
                 :class="'status-' + statusType"
                 @click="clearMessage"
            >
                {{ statusMessage }}
            </div>

        </div>
    `,
    
    data() {
        return {
            // Document selection
            availableDocuments: [],
            isLoadingDocuments: true,
            documentToEdit: '',
            selectedDocumentSlug: '',
            
            // Document configuration
            documentConfig: {
                slug: '',
                title: '',
                version: '',
                date: '',
                markdown_files: []
            },
            
            // Repository files
            availableFiles: [],
            fileConfigs: {},
            isLoadingFiles: false,
            
            // Preview functionality
            lastSelectedFile: null,
            currentFilePreview: '',
            isLoadingPreview: false,
            finalDocumentPreview: '',
            isLoadingFinalPreview: false,
            
            // UI state
            isUpdating: false,
            isDeleting: false,
            statusMessage: '',
            statusType: 'info', // 'success', 'error', 'info'
            
            // Drag and drop state
            draggedFileIndex: null,
            isDragging: false
        }
    },
    
    computed: {
        isFormValid() {
            return this.documentConfig.title.trim() && 
                   this.documentConfig.version.trim() && 
                   this.documentConfig.date && 
                   this.documentConfig.markdown_files.length > 0
        }
    },
    
    
    async mounted() {
        // Make this component globally accessible for onclick handlers
        window.editDocumentContentComponent = this;
        
        await this.loadAvailableDocuments()
        await this.loadRepositoryFiles()
        
        // Check if document slug is provided via URL parameter
        const urlParams = new URLSearchParams(window.location.search)
        const docSlug = urlParams.get('doc')
        if (docSlug) {
            this.documentToEdit = docSlug
            await this.loadDocumentForEditing()
        }
    },
    
    methods: {
        async loadAvailableDocuments() {
            this.isLoadingDocuments = true
            try {
                const response = await fetch('/api/documents')
                
                if (response.ok) {
                    const data = await response.json()
                    this.availableDocuments = data.documents || []
                } else {
                    throw new Error('Failed to fetch documents')
                }
            } catch (error) {
                this.showMessage('Error loading documents: ' + error.message, 'error')
            } finally {
                this.isLoadingDocuments = false
            }
        },
        
        async loadRepositoryFiles() {
            this.isLoadingFiles = true
            try {
                const response = await fetch('/api/files')
                if (response.ok) {
                    const data = await response.json()
                    this.availableFiles = data.files || []
                    // Load configurations after files are loaded
                    await this.loadFileConfigs()
                } else {
                    throw new Error('Failed to fetch repository files')
                }
            } catch (error) {
                this.showMessage('Warning: Could not load repository files', 'error')
                this.availableFiles = []
            } finally {
                this.isLoadingFiles = false
            }
        },

        async loadFileConfigs() {
            for (const file of this.availableFiles) {
                const configFile = file.replace('.md', '.yaml')
                try {
                    const response = await fetch(`/api/files/${configFile}`)
                    if (response.ok) {
                        const configData = await response.json()
                        // Parse YAML content (simple parsing for our specific structure)
                        const config = this.parseYAML(configData.content)
                        this.fileConfigs[file] = config
                    } else {
                        // Try fallback - direct file access
                        try {
                            const fallbackResponse = await fetch(`repository/${configFile}`)
                            if (fallbackResponse.ok) {
                                const yamlContent = await fallbackResponse.text()
                                const config = this.parseYAML(yamlContent)
                                this.fileConfigs[file] = config
                            } else {
                                throw new Error('No config file found')
                            }
                        } catch (fallbackError) {
                            // Create default config if none exists
                            this.fileConfigs[file] = {
                                title: file.replace('.md', '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
                                label: 'Document',
                                lastUpdate: new Date().toISOString()
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error loading config for ${file}:`, error)
                    this.fileConfigs[file] = {
                        title: file.replace('.md', '').replace(/-/g, ' '),
                        label: 'Document',
                        lastUpdate: new Date().toISOString()
                    }
                }
            }
        },

        parseYAML(yamlContent) {
            // Simple YAML parser for our specific structure
            const config = {}
            if (!yamlContent) return config
            
            const lines = yamlContent.split('\n')
            
            lines.forEach(line => {
                line = line.trim()
                if (line && !line.startsWith('#')) {
                    const colonIndex = line.indexOf(':')
                    if (colonIndex > 0) {
                        const key = line.substring(0, colonIndex).trim()
                        const value = line.substring(colonIndex + 1).trim()
                        
                        if (key && value) {
                            // Remove quotes and normalize key
                            config[key.toLowerCase()] = value.replace(/^["']|["']$/g, '')
                        }
                    }
                }
            })
            
            return config
        },

        getFileTitle(filename) {
            return this.fileConfigs[filename]?.title || filename.replace('.md', '').replace(/-/g, ' ')
        },

        formatDate(dateString) {
            if (!dateString) return 'Unknown'
            try {
                const date = new Date(dateString)
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
            } catch (error) {
                return 'Invalid date'
            }
        },
        
        async loadDocumentForEditing() {
            if (!this.documentToEdit) return;

            try {
                const response = await fetch(`/api/documents/${this.documentToEdit}/config`);

                if (response.ok) {
                    const config = await response.json();

                    // Ensure markdown_files is an array and has proper values
                    const markdownFiles = Array.isArray(config.markdown_files) ? config.markdown_files : [];

                    // Check if repository files are loaded
                    if (this.availableFiles.length === 0) {
                        await this.loadRepositoryFiles();
                    }

                    // Update document configuration
                    this.documentConfig.slug = config.slug || this.documentToEdit;
                    this.documentConfig.title = config.document_title || config.title || 'Unknown Title';
                    this.documentConfig.version = config.version || '1.0';
                    this.documentConfig.date = config.date || '';

                    // Add markdown files to the selected files box
                    this.documentConfig.markdown_files = [...markdownFiles];

                    this.selectedDocumentSlug = config.slug || this.documentToEdit;

                    // Force UI update to show selected files
                    this.$nextTick(() => {
                        this.$forceUpdate();
                        // Generate previews for the loaded document
                        if (this.documentConfig.markdown_files.length > 0) {
                            this.lastSelectedFile = this.documentConfig.markdown_files[this.documentConfig.markdown_files.length - 1]
                            this.previewFile(this.lastSelectedFile)
                            this.generateFinalPreview()
                        }
                    });

                    // Validate that selected files exist in repository
                    if (this.availableFiles.length > 0) {
                        setTimeout(() => {
                            this.validateSelectedFiles();
                        }, 100);
                    }

                    // Show success message with files from config
                    const filesList = markdownFiles.length > 0 ? markdownFiles.join(', ') : 'No files';
                    this.showMessage(
                        `Document loaded: "${this.documentConfig.title}"\n` +
                        `Slug: ${this.documentConfig.slug}\n` +
                        `Files from config.yaml: ${markdownFiles.length} selected\n` +
                        `Selected files: ${filesList}\n` +
                        `Version: ${this.documentConfig.version}`, 
                        'success'
                    );

                } else {
                    throw new Error('Failed to load document configuration')
                }
            } catch (error) {
                this.showMessage('Error loading document: ' + error.message, 'error')
            }
        },
        
        async validateSelectedFiles() {
            // Check if all selected files exist in the available repository files
            const missingFiles = this.documentConfig.markdown_files.filter(file => 
                !this.availableFiles.includes(file)
            )
            
            if (missingFiles.length > 0) {
                this.showMessage(
                    `Warning: Some files from the document configuration are not found in the repository:\n` +
                    `Missing files: ${missingFiles.join(', ')}\n\n` +
                    `These files will remain in the configuration but may cause issues when viewing the document.`,
                    'error'
                )
            }
        },
        
        async updateDocument() {
            if (!this.isFormValid) {
                this.showMessage('Please fill in all required fields and select at least one file.', 'error')
                return
            }

            this.isUpdating = true
            
            try {
                // Prepare document data for API
                const documentData = {
                    slug: this.documentConfig.slug, // Keep original slug
                    title: this.documentConfig.title,
                    version: this.documentConfig.version,
                    date: this.documentConfig.date,
                    markdown_files: this.documentConfig.markdown_files
                }
                
                // Create a dedicated update endpoint call
                const response = await fetch(`/api/documents/${this.documentConfig.slug}/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(documentData)
                })
                
                // Handle the response
                const result = await response.json()
                
                if (response.ok && result.success) {
                    this.showMessage(
                        `Document configuration updated successfully!\n\n` +
                        `Document: ${this.documentConfig.title}\n` +
                        `Files: ${this.documentConfig.markdown_files.length} selected\n` +
                        `Config file regenerated and saved`, 
                        'success'
                    )
                } else {
                    throw new Error(result.error || 'Failed to update document')
                }
                
            } catch (error) {
                this.showMessage('Error updating document: ' + error.message, 'error')
            } finally {
                this.isUpdating = false
            }
        },
        
        cancelEdit() {
            // Redirect to documents page instead of showing selector
            window.location.href = 'documents.html'
        },
        
        confirmDeleteDocument() {
            const confirmed = confirm(
                `Are you sure you want to delete this document?\n\n` +
                `Document: "${this.documentConfig.title}"\n` +
                `Slug: ${this.documentConfig.slug}\n\n` +
                `This action cannot be undone. The document folder and all its contents will be permanently deleted.`
            )
            
            if (confirmed) {
                this.deleteDocument()
            }
        },
        
        async deleteDocument() {
            this.isDeleting = true
            
            try {
                const response = await fetch(`/api/documents/${this.documentConfig.slug}`, {
                    method: 'DELETE'
                })
                
                const result = await response.json()
                
                if (response.ok && result.success) {
                    this.showMessage(
                        `Document "${this.documentConfig.title}" deleted successfully!\n\n` +
                        `The document folder and all its contents have been removed.`,
                        'success'
                    )
                    
                    // Redirect to documents page after deletion
                    setTimeout(() => {
                        window.location.href = 'documents.html'
                    }, 2000)
                } else {
                    throw new Error(result.error || 'Failed to delete document')
                }
                
            } catch (error) {
                this.showMessage('Error deleting document: ' + error.message, 'error')
            } finally {
                this.isDeleting = false
            }
        },
        
        // File selection and preview methods
        previewFileOnly(fileName) {
            // Single click: only preview the file without toggling selection
            if (!fileName) return
            this.lastSelectedFile = fileName
            this.previewFile(fileName)
        },
        
        toggleFileSelection(fileName) {
            const index = this.documentConfig.markdown_files.indexOf(fileName)
            if (index === -1) {
                // Add file to selection
                this.documentConfig.markdown_files.push(fileName)
                this.lastSelectedFile = fileName
                this.previewFile(fileName)
            } else {
                // Remove file from selection
                this.documentConfig.markdown_files.splice(index, 1)
                if (this.lastSelectedFile === fileName) {
                    this.lastSelectedFile = this.documentConfig.markdown_files.length > 0 
                        ? this.documentConfig.markdown_files[this.documentConfig.markdown_files.length - 1]
                        : null
                    if (this.lastSelectedFile) {
                        this.previewFile(this.lastSelectedFile)
                    } else {
                        this.currentFilePreview = ''
                    }
                }
            }
            this.generateFinalPreview()
        },
        
        async previewFile(fileName) {
            if (!fileName) return
            
            this.lastSelectedFile = fileName
            this.isLoadingPreview = true
            this.currentFilePreview = ''
            
            try {
                let response = await fetch(`/api/files/${fileName}`)
                let content
                
                if (response.ok) {
                    const data = await response.json()
                    content = data.content
                } else {
                    // Fallback to direct file access
                    response = await fetch(`repository/${fileName}`)
                    if (!response.ok) {
                        throw new Error(`Failed to load ${fileName}`)
                    }
                    content = await response.text()
                }
                
                this.currentFilePreview = marked.parse(content)
            } catch (error) {
                console.error('Error loading file preview:', error)
                this.currentFilePreview = `
                    <div style="color: red; display: flex; align-items: center; gap: 8px; padding: 10px; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px;">
                        <span>Error loading ${fileName}: ${error.message}</span>
                        <button 
                            onclick="window.editDocumentContentComponent.removeFileFromConfig('${fileName}')" 
                            style="background: #e53e3e; color: white; border: none; border-radius: 3px; padding: 2px 6px; font-size: 11px; cursor: pointer; white-space: nowrap;"
                            title="Remove ${fileName} from document configuration"
                        >
                            Remove
                        </button>
                    </div>
                `
            } finally {
                this.isLoadingPreview = false
            }
        },
        
        async generateFinalPreview() {
            if (this.documentConfig.markdown_files.length === 0) {
                this.finalDocumentPreview = ''
                return
            }
            
            this.isLoadingFinalPreview = true
            let combinedContent = ''
            
            try {
                for (const fileName of this.documentConfig.markdown_files) {
                    try {
                        let response = await fetch(`/api/files/${fileName}`)
                        let content
                        
                        if (response.ok) {
                            const data = await response.json()
                            content = data.content
                        } else {
                            // Fallback to direct file access
                            response = await fetch(`repository/${fileName}`)
                            if (!response.ok) {
                                throw new Error(`Failed to load ${fileName}`)
                            }
                            content = await response.text()
                        }
                        
                        combinedContent += `\n\n<!-- File: ${fileName} -->\n\n`
                        combinedContent += content
                        combinedContent += `\n\n`
                    } catch (error) {
                        console.error(`Error loading ${fileName}:`, error)
                        combinedContent += `\n\n<div style="color: red; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; padding: 10px; margin: 10px 0;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span><strong>Error loading ${fileName}</strong>: ${error.message}</span>
                                <button 
                                    onclick="window.editDocumentContentComponent.removeFileFromConfig('${fileName}')" 
                                    style="background: #e53e3e; color: white; border: none; border-radius: 3px; padding: 2px 6px; font-size: 11px; cursor: pointer; white-space: nowrap;"
                                    title="Remove ${fileName} from document configuration"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>\n\n`
                    }
                }
                
                this.finalDocumentPreview = marked.parse(combinedContent)
            } catch (error) {
                console.error('Error generating final preview:', error)
                this.finalDocumentPreview = `<div style="color: red;">Error generating preview: ${error.message}</div>`
            } finally {
                this.isLoadingFinalPreview = false
            }
        },
        
        getFileOrder(fileName) {
            const index = this.documentConfig.markdown_files.indexOf(fileName)
            return index === -1 ? 0 : index + 1
        },
        
        isFileSelected(fileName) {
            return this.documentConfig.markdown_files.includes(fileName)
        },
        
        showMessage(message, type = 'info') {
            this.statusMessage = message
            this.statusType = type
            setTimeout(() => {
                this.statusMessage = ''
            }, type === 'success' ? 10000 : 5000)
        },
        
        // Drag and drop methods for file reordering
        onTagDragStart(event, index) {
            this.draggedFileIndex = index
            this.isDragging = true
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', index.toString())
            
            // Add a small delay to allow CSS transition
            setTimeout(() => {
                event.target.style.opacity = '0.5'
            }, 0)
        },
        
        onTagDragEnd(event) {
            this.isDragging = false
            this.draggedFileIndex = null
            event.target.style.opacity = '1'
        },
        
        onTagDragOver(event, targetIndex) {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
        },
        
        onTagDrop(event, targetIndex) {
            event.preventDefault()
            const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'))
            
            if (sourceIndex !== targetIndex && sourceIndex !== null) {
                this.reorderFiles(sourceIndex, targetIndex)
            }
        },
        
        reorderFiles(fromIndex, toIndex) {
            const files = [...this.documentConfig.markdown_files]
            const movedFile = files.splice(fromIndex, 1)[0]
            files.splice(toIndex, 0, movedFile)
            
            this.documentConfig.markdown_files = files
            
            // Update preview if the currently selected file was moved
            if (this.lastSelectedFile) {
                const newIndex = files.indexOf(this.lastSelectedFile)
                if (newIndex !== -1) {
                    // Regenerate final preview to reflect new order
                    this.generateFinalPreview()
                }
            }
        },
        
        removeFileFromConfig(fileName) {
            const index = this.documentConfig.markdown_files.indexOf(fileName)
            if (index !== -1) {
                // Remove the file from the configuration
                this.documentConfig.markdown_files.splice(index, 1)
                
                // Show confirmation message
                this.showMessage(`Removed "${fileName}" from document configuration.`, 'info')
                
                // Update preview if this was the currently selected file
                if (this.lastSelectedFile === fileName) {
                    this.lastSelectedFile = this.documentConfig.markdown_files.length > 0 
                        ? this.documentConfig.markdown_files[this.documentConfig.markdown_files.length - 1]
                        : null
                    
                    if (this.lastSelectedFile) {
                        this.previewFile(this.lastSelectedFile)
                    } else {
                        this.currentFilePreview = ''
                    }
                }
                
                // Regenerate the final preview
                this.generateFinalPreview()
                
                // Force update to refresh the UI
                this.$forceUpdate()
            }
        },
        
        clearMessage() {
            this.statusMessage = ''
        }
    }
}
