// New Document Content Component
const NewDocumentContent = {
    template: `
        <div class="new-document-content">
            <!-- Header Section -->
            <section class="new-document-header">
                <h2>📝 Create New Document</h2>
                <p>Create a new document by configuring its structure and selecting repository snippets to include.</p>
            </section>

            <!-- Document Configuration Form -->
            <section class="document-config-section">
                <div class="config-form-container">
                    <h3>📋 Document Configuration</h3>
                    
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
                            <p class="section-description">Select the repository files to include in your document:</p>
                            
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
                                        <div v-else>
                                            <div 
                                                v-for="file in availableFiles" 
                                                :key="file"
                                                class="file-item-selector"
                                                @click="toggleFile(file)"
                                                :class="{ 'selected': isFileSelected(file) }"
                                            >
                                                <div class="file-checkbox">
                                                    <input 
                                                        type="checkbox" 
                                                        :checked="isFileSelected(file)"
                                                        @change="toggleFile(file)"
                                                    >
                                                </div>
                                                <div class="file-info">
                                                    <span class="file-name">{{ file }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="selected-files">
                                    <h5>Selected Files ({{ documentConfig.markdown_files.length }})</h5>
                                    <div class="selected-list">
                                        <div v-if="documentConfig.markdown_files.length === 0" class="empty-selection">
                                            No files selected
                                        </div>
                                        <div v-else>
                                            <div 
                                                v-for="(file, index) in documentConfig.markdown_files" 
                                                :key="file"
                                                class="selected-file-item"
                                            >
                                                <span class="file-order">{{ index + 1 }}.</span>
                                                <span class="file-name">{{ file }}</span>
                                                <button 
                                                    type="button"
                                                    @click="removeFile(file)"
                                                    class="remove-file-btn"
                                                    title="Remove file"
                                                >
                                                    ❌
                                                </button>
                                                <button 
                                                    type="button"
                                                    @click="moveFileUp(index)"
                                                    :disabled="index === 0"
                                                    class="move-btn"
                                                    title="Move up"
                                                >
                                                    ⬆️
                                                </button>
                                                <button 
                                                    type="button"
                                                    @click="moveFileDown(index)"
                                                    :disabled="index === documentConfig.markdown_files.length - 1"
                                                    class="move-btn"
                                                    title="Move down"
                                                >
                                                    ⬇️
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
                                {{ isCreating ? '📄 Creating Document...' : '✅ Create Document' }}
                            </button>
                            
                            <button 
                                type="button" 
                                class="btn btn-secondary"
                                @click="previewConfiguration"
                                :disabled="!isFormValid"
                            >
                                👁️ Preview Configuration
                            </button>
                            
                            <button 
                                type="button" 
                                class="btn btn-outline"
                                @click="resetForm"
                            >
                                🔄 Reset Form
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Configuration Preview -->
            <section v-if="showPreview" class="config-preview-section">
                <div class="preview-container">
                    <h3>📋 Configuration Preview</h3>
                    <div class="yaml-preview">
                        <h4>config.yaml</h4>
                        <pre><code>{{ generateYAMLPreview() }}</code></pre>
                    </div>
                    <button @click="showPreview = false" class="btn btn-outline btn-sm">
                        ❌ Close Preview
                    </button>
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
            messageType: 'success'
        }
    },
    computed: {
        isFormValid() {
            return this.documentConfig.name.trim() !== '' && 
                   this.documentConfig.title.trim() !== '' &&
                   this.documentConfig.version.trim() !== '' &&
                   this.documentConfig.date.trim() !== '' &&
                   this.documentConfig.markdown_files.length > 0
        }
    },
    async mounted() {
        await this.loadAvailableFiles()
    },
    methods: {
        async loadAvailableFiles() {
            this.isLoadingFiles = true
            try {
                // Try to fetch repository files
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
                    'faq.md'
                ]
                
                const availableFiles = []
                
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
                
                this.availableFiles = availableFiles
                
                if (this.availableFiles.length === 0) {
                    this.showMessage('No markdown files found in repository. You can still create a document configuration.', 'info')
                }
                
            } catch (error) {
                console.error('Error loading files:', error)
                this.showMessage('Error loading repository files: ' + error.message, 'error')
            } finally {
                this.isLoadingFiles = false
            }
        },

        toggleFile(filename) {
            const index = this.documentConfig.markdown_files.indexOf(filename)
            if (index === -1) {
                this.documentConfig.markdown_files.push(filename)
            } else {
                this.documentConfig.markdown_files.splice(index, 1)
            }
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

        moveFileUp(index) {
            if (index > 0) {
                const files = [...this.documentConfig.markdown_files]
                const temp = files[index]
                files[index] = files[index - 1]
                files[index - 1] = temp
                this.documentConfig.markdown_files = files
            }
        },

        moveFileDown(index) {
            if (index < this.documentConfig.markdown_files.length - 1) {
                const files = [...this.documentConfig.markdown_files]
                const temp = files[index]
                files[index] = files[index + 1]
                files[index + 1] = temp
                this.documentConfig.markdown_files = files
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

        async createDocument() {
            if (!this.isFormValid) {
                this.showMessage('Please fill in all required fields and select at least one file.', 'error')
                return
            }

            this.isCreating = true
            
            try {
                // Generate the YAML configuration
                const yamlContent = this.generateYAMLPreview()
                
                // In a real implementation, this would save the configuration to the server
                // For now, we'll simulate the creation process
                
                await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
                
                this.showMessage(`✅ Document "${this.documentConfig.name}" created successfully! You can now view it in the Documents page.`, 'success')
                
                // Optional: redirect to documents page after creation
                setTimeout(() => {
                    window.location.href = 'documents.html'
                }, 3000)
                
            } catch (error) {
                console.error('Error creating document:', error)
                this.showMessage('❌ Error creating document: ' + error.message, 'error')
            } finally {
                this.isCreating = false
            }
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
