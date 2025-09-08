/**
 * Project:   Orchea            <!-- Repository Management Form -->
            <div class="form-section">
                <div class="form-group">ular Documentation System
 * File:      RepositoryManager.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Repository file management component with create, edit, and delete functionality.
 *   Handles markdown file operations and provides live preview capabilities.
 *
 * License: MIT
 */

// RepositoryManager Vue Component
const RepositoryManager = {
    template: `
        <div class="repository-content">
            <!-- Hero Section -->
            <section class="repository-hero">
                <h2><i class="fas fa-folder-open"></i> Content Repository</h2>
                <p>Manage your markdown content snippets and files. Create reusable content blocks that can be assembled into complete documents using YAML configurations.</p>
            </section>

            <!-- Repository File Management -->
            <div class="repository-content-section">
                <div class="form-group">
                    <div class="form-actions">
                        <button class="btn btn-primary" @click="createNewFile">
                            <i class="fas fa-plus"></i>
                            New File
                        </button>
                        <button class="btn btn-secondary" @click="loadFiles">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>
                </div>

                <div class="content-selection-grid">
                    <div class="file-selection-panel">
                        <div class="panel-header">
                            Repository Files
                            <span class="file-count">{{ files.length }} files</span>
                        </div>
                        <div class="file-selection-list">
                            <div v-if="isLoading" class="loading-indicator">
                                <div class="loading-icon">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </div>
                                <div class="loading-text">
                                    Loading repository files...
                                </div>
                            </div>
                            <div v-else-if="!apiAvailable" class="api-warning">
                                <div class="warning-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="warning-text">
                                    Using fallback file list - API not available
                                </div>
                            </div>
                            <div v-else-if="files.length === 0" class="no-files">
                                <div class="empty-icon">
                                    <i class="fas fa-folder-open"></i>
                                </div>
                                <div class="empty-text">
                                    <h4>No Files Found</h4>
                                    <p>No markdown files found in repository</p>
                                </div>
                            </div>
                            <div v-else>
                                <div 
                                    v-for="file in files" 
                                    :key="file"
                                    class="file-selection-item"
                                    :class="{ 'selected': currentFile === file }"
                                    @click="previewFile(file)"
                                >
                                    <span class="file-icon">
                                        <i class="fas fa-file-alt" style="color: #667eea;"></i>
                                    </span>
                                    <span class="file-name-display">{{ file }}</span>
                                    <span v-if="currentFile === file" class="file-status" style="color: #28a745;">
                                        <i class="fas fa-eye"></i>
                                    </span>
                                    <div class="file-actions">
                                        <button class="btn-icon btn-edit" @click.stop="editFile(file)" title="Edit file">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" @click.stop="deleteFile(file)" title="Delete file">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="file-preview-panel">
                        <div class="panel-header">
                            File Preview
                            <span v-if="currentFile" class="file-count">{{ currentFile }}</span>
                        </div>
                        <div class="file-preview-content">
                            <div v-if="!currentFile && !isEditing" class="no-preview">
                                <div class="preview-icon">
                                    <i class="fas fa-file-alt"></i>
                                </div>
                                <div class="preview-text">
                                    <h4>No File Selected</h4>
                                    <p>Select a file from the repository to preview its content</p>
                                </div>
                            </div>
                            
                            <!-- EasyMDE Editor -->
                            <div v-else-if="isEditing" class="editor-container">
                                <div v-if="!currentFile" class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-file"></i> File Name
                                    </label>
                                    <input 
                                        v-model="newFileName"
                                        type="text" 
                                        placeholder="new-file.md" 
                                        class="form-input"
                                        @keyup.enter="saveNewFile" />
                                    <small class="form-help">Enter filename with .md extension</small>
                                </div>
                                
                                <div class="easymde-container">
                                    <textarea ref="easyMDETextarea" class="easymde-textarea"></textarea>
                                </div>
                                
                                <div class="form-actions">
                                    <button class="btn btn-primary" @click="currentFile ? saveFile() : saveNewFile()">
                                        <i class="fas fa-save"></i> {{ currentFile ? 'Save Changes' : 'Create File' }}
                                    </button>
                                    <button class="btn btn-secondary" @click="cancelEdit">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                </div>
                            </div>
                            
                            <!-- File Preview -->
                            <div v-else class="preview-markdown" v-html="renderedContent"></div>
                            
                            <!-- Success/Error Messages -->
                            <div v-if="message" 
                                 :class="['message-alert', 'message-' + messageType]">
                                <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                                {{ message }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            files: [],
            currentFile: null,
            isEditing: false,
            isLoading: true,
            apiAvailable: true,
            editContent: '',
            newFileName: '',
            renderedContent: '',
            message: '',
            messageType: 'success',
            easyMDE: null
        }
    },
    async mounted() {
        await this.loadFiles()
    },
    methods: {
        async loadFiles() {
            this.isLoading = true
            try {
                const response = await fetch('/api/files')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                this.files = data.files
                this.apiAvailable = true
            } catch (error) {
                console.error('Error loading file list:', error)
                // Fallback to static list if API is not available
                this.files = ['intro.md', 'getting-started.md', 'configuration.md', 'conclusion.md']
                this.apiAvailable = false
            } finally {
                this.isLoading = false
            }
        },

        async previewFile(filename) {
            if (this.isEditing) {
                if (!confirm('You have unsaved changes. Do you want to discard them?')) {
                    return
                }
            }

            this.currentFile = filename
            this.isEditing = false
            this.clearMessage()

            try {
                let response = await fetch(`/api/files/${filename}`)
                let content

                if (response.ok) {
                    const data = await response.json()
                    content = data.content
                } else {
                    // Fallback to direct file access
                    response = await fetch(`repository/${filename}`)
                    if (!response.ok) {
                        throw new Error(`Failed to load ${filename}`)
                    }
                    content = await response.text()
                }

                this.renderedContent = marked.parse(content)
            } catch (error) {
                console.error('Error loading file:', error)
                this.renderedContent = `<div style="color: red;">Error loading ${filename}: ${error.message}</div>`
            }
        },

        async editFile(filename) {
            this.currentFile = filename
            this.isEditing = true
            this.clearMessage()

            try {
                let response = await fetch(`/api/files/${filename}`)
                let content

                if (response.ok) {
                    const data = await response.json()
                    content = data.content
                } else {
                    // Fallback to direct file access
                    response = await fetch(`repository/${filename}`)
                    if (!response.ok) {
                        throw new Error(`Failed to load ${filename}`)
                    }
                    content = await response.text()
                }

                this.editContent = content
                this.$nextTick(() => {
                    this.initializeEasyMDE()
                })
            } catch (error) {
                console.error('Error loading file for editing:', error)
                this.showMessage(`Error loading ${filename} for editing: ${error.message}`, 'error')
            }
        },

        async saveFile() {
            if (!this.currentFile || !this.isEditing) return

            // Get content from EasyMDE editor
            if (this.easyMDE) {
                this.editContent = this.easyMDE.value()
            }

            try {
                const response = await fetch(`/api/files/${this.currentFile}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: this.editContent })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to save file')
                }

                const result = await response.json()
                this.showMessage(`File saved successfully at ${new Date(result.timestamp).toLocaleTimeString()}`, 'success')
                this.renderedContent = marked.parse(this.editContent)
                this.destroyEasyMDE()
                this.isEditing = false
            } catch (error) {
                console.error('Error saving file:', error)
                this.showMessage(`Error saving file: ${error.message}`, 'error')
            }
        },

        async saveNewFile() {
            const filename = this.newFileName.trim()

            // Validate filename
            if (!filename) {
                this.showMessage('Please enter a filename', 'error')
                return
            }

            if (!filename.endsWith('.md')) {
                this.showMessage('Filename must end with .md', 'error')
                return
            }

            if (!/^[a-zA-Z0-9-_]+\.md$/.test(filename)) {
                this.showMessage('Filename can only contain letters, numbers, hyphens, and underscores', 'error')
                return
            }

            // Get content from EasyMDE editor
            if (this.easyMDE) {
                this.editContent = this.easyMDE.value()
            }

            try {
                const response = await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, content: this.editContent })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to create file')
                }

                const result = await response.json()
                await this.loadFiles()
                this.showMessage(`File created successfully at ${new Date(result.timestamp).toLocaleTimeString()}`, 'success')
                this.currentFile = filename
                this.renderedContent = marked.parse(this.editContent)
                this.destroyEasyMDE()
                this.isEditing = false
                this.newFileName = ''
            } catch (error) {
                console.error('Error creating file:', error)
                this.showMessage(`Error creating file: ${error.message}`, 'error')
            }
        },

        async deleteFile(filename) {
            const confirmed = confirm(`Are you sure you want to delete "${filename}"?\n\nThis action cannot be undone.`)
            
            if (!confirmed) return

            try {
                const response = await fetch(`/api/files/${filename}`, {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to delete file')
                }

                // If deleted file was currently selected, clear preview
                if (this.currentFile === filename) {
                    this.currentFile = null
                    this.isEditing = false
                    this.renderedContent = ''
                }

                await this.loadFiles()
                this.showMessage(`"${filename}" deleted successfully`, 'success')
            } catch (error) {
                console.error('Error deleting file:', error)
                this.showMessage(`Error deleting file: ${error.message}`, 'error')
            }
        },

        createNewFile() {
            if (this.isEditing) {
                if (!confirm('You have unsaved changes. Do you want to discard them?')) {
                    return
                }
                this.destroyEasyMDE()
            }

            this.currentFile = null
            this.isEditing = true
            this.editContent = ''
            this.newFileName = ''
            this.clearMessage()
            this.$nextTick(() => {
                this.initializeEasyMDE()
            })
        },

        cancelEdit() {
            this.destroyEasyMDE()
            
            if (this.currentFile) {
                // If editing an existing file, go back to preview mode
                this.isEditing = false
                this.previewFile(this.currentFile)
            } else {
                // If creating a new file, clear everything
                this.currentFile = null
                this.isEditing = false
                this.renderedContent = ''
                this.editContent = ''
                this.newFileName = ''
            }
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
        },

        // EasyMDE Editor Methods
        initializeEasyMDE() {
            if (this.easyMDE) {
                this.destroyEasyMDE()
            }

            this.$nextTick(() => {
                const textarea = this.$refs.easyMDETextarea
                if (textarea && window.EasyMDE) {
                    try {
                        this.easyMDE = new window.EasyMDE({
                            element: textarea,
                            initialValue: this.editContent || '',
                            placeholder: 'Start writing your markdown content...',
                            spellChecker: false,
                            autofocus: true,
                            status: false,
                            toolbar: [
                                'bold', 'italic', 'strikethrough', '|',
                                'heading', 'heading-smaller', 'heading-bigger', '|',
                                'code', 'quote', 'unordered-list', 'ordered-list', '|',
                                'link', 'image', 'table', '|',
                                'preview', 'side-by-side', 'fullscreen', '|',
                                'guide'
                            ],
                            renderingConfig: {
                                singleLineBreaks: false,
                                codeSyntaxHighlighting: true,
                            }
                        })
                    } catch (error) {
                        console.error('Error initializing EasyMDE:', error)
                        this.showMessage('Error initializing editor. Please try again.', 'error')
                    }
                } else {
                    console.error('EasyMDE not loaded or textarea not found')
                    this.showMessage('Editor not available. Please refresh the page.', 'error')
                }
            })
        },

        destroyEasyMDE() {
            if (this.easyMDE) {
                try {
                    this.easyMDE.toTextArea()
                    this.easyMDE = null
                } catch (error) {
                    console.warn('Error destroying EasyMDE editor:', error)
                }
            }
        }
    }
}
