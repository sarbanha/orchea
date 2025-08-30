// Edit Document Content Component
const EditDocumentContent = {
    template: `
        <div class="new-document-content">
            <!-- Header Section -->
            <section class="new-document-header">
                <h2>✏️ Edit Document</h2>
                <p>Modify an existing document's configuration and structure by selecting repository snippets to include.</p>
            </section>

            <!-- No Document Loaded Message -->
            <section class="document-config-section" v-if="!selectedDocumentSlug && !isLoadingDocuments">
                <div class="config-form-container">
                    <div class="no-document-message">
                        <h3>📄 No Document Selected</h3>
                        <p>To edit a document, please access this page with a document parameter:</p>
                        <code>edit-document.html?doc=your-document-slug</code>
                        <br><br>
                        <a href="documents.html" class="btn btn-primary">← Browse Documents</a>
                    </div>
                </div>
            </section>

            <!-- Document Configuration Form -->
            <section class="document-config-section" v-if="selectedDocumentSlug">
                <div class="config-form-container">
                    <div class="document-header-info">
                        <h3>✏️ Editing: {{ documentConfig.title }}</h3>
                        <div class="document-meta">
                            <span class="meta-badge">📁 {{ selectedDocumentSlug }}</span>
                            <span class="meta-badge">📅 {{ documentConfig.date }}</span>
                            <span class="meta-badge">🏷️ v{{ documentConfig.version }}</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                            ← Back to Documents
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
                            <p class="section-description">Drag repository files to the selected files box to include them in your document:</p>
                            
                            <div class="content-selector">
                                <div class="available-files">
                                    <h5>Available Repository Files</h5>
                                    <div class="file-list-container">
                                        <div v-if="isLoadingFiles" class="loading-indicator">
                                            📄 Loading repository files...
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
                                                <span class="file-drag-handle">☰ </span>
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
                                            📋 Drop files here or drag to reorder
                                        </div>
                                        <div v-else>
                                            <div 
                                                v-for="(file, index) in documentConfig.markdown_files" 
                                                :key="'selected-' + file + '-' + index"
                                                class="selected-file-item file-pill"
                                                draggable="true"
                                                @dragstart="onSelectedFileDragStart($event, index)"
                                                @dragover.prevent
                                                @drop.prevent="onSelectedFileDrop($event, index)"
                                            >
                                                <span class="file-drag-handle">☰ </span>
                                                <span class="file-name">{{ file }}</span>
                                                <button 
                                                    type="button"
                                                    @click="removeFile(file)"
                                                    class="remove-file-btn"
                                                    title="Remove file"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="form-actions">
                            <button 
                                type="submit" 
                                class="btn btn-primary btn-lg"
                                :disabled="!isFormValid || isUpdating"
                                :class="{ 'btn-loading': isUpdating }"
                            >
                                <span v-if="isUpdating">🔄 Updating Document...</span>
                                <span v-else>💾 Update Document</span>
                            </button>
                            
                            <button 
                                type="button" 
                                class="btn btn-secondary btn-lg"
                                @click="cancelEdit"
                                :disabled="isUpdating"
                            >
                                ❌ Cancel
                            </button>
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
            
            // Repository files (matching NewDocumentContent structure)
            availableFiles: [],
            isLoadingFiles: false,
            
            // UI state
            isDragOver: false,
            draggedFileIndex: null, // For reordering selected files
            isUpdating: false,
            statusMessage: '',
            statusType: 'info' // 'success', 'error', 'info'
        }
    },
    
    computed: {
        isFormValid() {
            return this.documentConfig.title.trim() && 
                   this.documentConfig.version.trim() && 
                   this.documentConfig.date && 
                   this.documentConfig.markdown_files.length > 0
        },
        
        availableFilesFiltered() {
            // Filter out files that are already selected in the YAML config
            return this.availableFiles.filter(file => 
                !this.documentConfig.markdown_files.includes(file)
            )
        }
    },
    
    
    async mounted() {
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
                        `✅ Document loaded: "${this.documentConfig.title}"\n` +
                        `📁 Slug: ${this.documentConfig.slug}\n` +
                        `📄 Files from config.yaml: ${markdownFiles.length} selected\n` +
                        `📋 Selected files: ${filesList}\n` +
                        `🏷️ Version: ${this.documentConfig.version}`, 
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
                    `⚠️ Warning: Some files from the document configuration are not found in the repository:\\n` +
                    `Missing files: ${missingFiles.join(', ')}\\n\\n` +
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
                        `✅ Document configuration updated successfully!\n\n` +
                        `📁 Document: ${this.documentConfig.title}\n` +
                        `📄 Files: ${this.documentConfig.markdown_files.length} selected\n` +
                        `� Config file regenerated and saved`, 
                        'success'
                    )
                } else {
                    throw new Error(result.error || 'Failed to update document')
                }
                
            } catch (error) {
                this.showMessage('❌ Error updating document: ' + error.message, 'error')
            } finally {
                this.isUpdating = false
            }
        },
        
        cancelEdit() {
            // Redirect to documents page instead of showing selector
            window.location.href = 'documents.html'
        },
        
        // File selection methods (matching NewDocumentContent exactly)
        onDragStart(event, fileName) {
            event.dataTransfer.setData('text/plain', fileName)
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
        
        removeSelectedFile(index) {
            this.documentConfig.markdown_files.splice(index, 1)
        },
        
        showMessage(message, type = 'info') {
            this.statusMessage = message
            this.statusType = type
            setTimeout(() => {
                this.statusMessage = ''
            }, type === 'success' ? 10000 : 5000)
        },
        
        clearMessage() {
            this.statusMessage = ''
        }
    }
}
