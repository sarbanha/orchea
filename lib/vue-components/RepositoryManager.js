/**
 * Project:   Orchea - Modular Documentation System
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
            <div class="repository-section">
            <div class="file-list-box">
                <h3>
                    <i class="fas fa-folder"></i> Repository Files
                    <button class="new-file-btn" @click="createNewFile"><i class="fas fa-plus"></i></button>
                </h3>
                <ul class="file-list">
                    <li v-if="isLoading" class="loading-text">Loading files...</li>
                    <li v-else-if="!apiAvailable" style="color: orange; font-size: 12px;">
                        <i class="fas fa-exclamation-triangle"></i> Using fallback file list - API not available
                    </li>
                    <li v-for="file in files" 
                        :key="file" 
                        class="file-item"
                        :class="{ active: currentFile === file }"
                        @click="previewFile(file)">
                        <button class="edit-btn" @click.stop="editFile(file)"><i class="fas fa-edit"></i></button>
                        <span class="file-name">{{ file }}</span>
                        <button class="delete-btn" @click.stop="deleteFile(file)"><i class="fas fa-trash"></i></button>
                    </li>
                </ul>
            </div>

            <div class="preview-box">
                <h3><i class="fas fa-file-alt"></i> File Preview</h3>
                <div class="preview-content">
                    <div v-if="!currentFile && !isEditing" class="loading-text">
                        Select a file to preview
                    </div>
                    
                    <!-- EasyMDE Editor -->
                    <div v-else-if="isEditing" class="easymde-editor">
                        <div v-if="!currentFile" class="filename-input">
                            <label><i class="fas fa-file"></i> File Name:</label>
                            <input 
                                v-model="newFileName"
                                type="text" 
                                placeholder="new-file.md" 
                                class="form-input"
                                @keyup.enter="saveNewFile" />
                        </div>
                        
                        <div class="easymde-container">
                            <textarea ref="easyMDETextarea" class="easymde-textarea"></textarea>
                        </div>
                        
                        <div class="editor-actions">
                            <button class="save-btn" @click="currentFile ? saveFile() : saveNewFile()">
                                <i class="fas fa-save"></i> {{ currentFile ? 'Save' : 'Create File' }}
                            </button>
                            <button class="cancel-btn" @click="cancelEdit">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                    
                    <!-- File Preview -->
                    <div v-else v-html="renderedContent"></div>
                    
                    <!-- Success/Error Messages -->
                    <div v-if="message" 
                         :class="['message', messageType]"
                         style="padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                        {{ message }}
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
