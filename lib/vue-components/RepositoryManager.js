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
                                    <span class="file-name-display">{{ getFileTitle(file) }}</span>
                                    <span v-if="currentFile === file" class="file-status" style="color: #28a745;">
                                        <i class="fas fa-eye"></i>
                                    </span>
                                    <div class="file-actions">
                                        <button class="btn-icon btn-edit" @click.stop="editFile(file)" title="Edit file">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-duplicate" @click.stop="duplicateFile(file)" title="Duplicate file">
                                            <i class="fas fa-copy"></i>
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
                                
                                <!-- Title and Label Fields -->
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-heading"></i> Title
                                        </label>
                                        <input 
                                            v-model="fileTitle"
                                            type="text" 
                                            placeholder="Document Title" 
                                            class="form-input"
                                            required />
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-tags"></i> Labels
                                        </label>
                                        <input 
                                            v-model="fileLabels"
                                            type="text" 
                                            placeholder="tag1, tag2, tag3" 
                                            class="form-input"
                                            required />
                                        <small class="form-help">Enter multiple labels separated by commas</small>
                                    </div>
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
                            <div v-else>
                                <div class="preview-markdown" v-html="renderedContent"></div>
                                
                                <!-- File Label Information -->
                                <div v-if="currentFile && fileConfigs[currentFile]" class="file-label-info">
                                    <div class="label-display">
                                        <i class="fas fa-tag"></i>
                                        <div class="label-display" v-if="fileConfigs[currentFile].labels && Array.isArray(fileConfigs[currentFile].labels)">
                                            <span v-for="(label, index) in fileConfigs[currentFile].labels" :key="index" class="tag-pill">
                                                {{ label }}
                                            </span>
                                        </div>
                                        <span class="label-text" v-else-if="fileConfigs[currentFile].label">{{ fileConfigs[currentFile].label }}</span>
                                        <span class="last-update">
                                            <i class="fas fa-clock"></i>
                                            Last updated: {{ formatDate(fileConfigs[currentFile].lastUpdate) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Success/Error Messages -->
                            <div v-if="message" 
                                 :class="['message-alert', 'message-' + messageType]">
                                <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                                {{ message }}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tags Section -->
                <div class="tags-section" v-if="tags.length > 0">
                    <div class="tags-header">
                        <h4><i class="fas fa-tags"></i> Content Tags</h4>
                        <span class="tag-count">{{ tagStats.uniqueLabels }} unique tags</span>
                    </div>
                    <div class="tags-container">
                        <div 
                            v-for="tag in tags" 
                            :key="tag.label"
                            class="tag-pill"
                            :class="{ 'tag-selected': isTagSelected(tag.label) }"
                            :title="getTagTooltip(tag)"
                            @click="toggleTagFilter(tag.label)"
                        >
                            <span class="tag-label">{{ tag.label }}</span>
                            <span class="tag-count">{{ tag.count }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            files: [],
            allFiles: [], // Store all files for filtering
            fileConfigs: {},
            tags: [],
            tagStats: {},
            selectedTags: [], // Track selected tag filters
            currentFile: null,
            isEditing: false,
            isLoading: false,
            apiAvailable: true,
            editContent: '',
            newFileName: '',
            fileTitle: '',
            fileLabels: '',
            renderedContent: '',
            message: '',
            messageType: 'success',
            easyMDE: null,
            isLoadingFiles: false
        }
    },
    async mounted() {
        await this.loadFiles();
        await this.loadTags();
    },
    methods: {
        async loadFiles() {
            // Prevent multiple simultaneous file loading operations
            if (this.isLoadingFiles) {
                console.log('File loading already in progress, skipping duplicate request');
                return;
            }
            
            try {
                this.isLoadingFiles = true;
                this.isLoading = true;
                
                // Auto-create missing YAML configs when loading files (only on first load)
                const autoCreate = this.files.length === 0;
                const url = autoCreate ? '/api/files?autoCreateConfigs=true' : '/api/files';
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.allFiles = data.files; // Store all files
                this.files = data.files; // Display all files initially
                
                // Load configurations for all files
                await this.loadFileConfigs();
                // Reload tags after files are updated
                await this.loadTags();
                // Apply any existing filters
                this.applyTagFilters();
            } catch (error) {
                console.error('Error loading files:', error);
            } finally {
                this.isLoading = false;
                this.isLoadingFiles = false;
            }
        },

        async loadFileConfigs() {
            for (const file of this.allFiles || this.files) {
                const configFile = file.replace('.md', '.yaml')
                try {
                    const response = await fetch(`/api/files/${configFile}`)
                    if (response.ok) {
                        const configData = await response.json()
                        console.log(`Loading config for ${file}:`, configData.content)
                        // Parse YAML content (simple parsing for basic structure)
                        const config = this.parseYAML(configData.content)
                        console.log(`Parsed config for ${file}:`, config)
                        this.fileConfigs[file] = config
                    } else {
                        // Try fallback - direct file access
                        try {
                            const fallbackResponse = await fetch(`repository/${configFile}`)
                            if (fallbackResponse.ok) {
                                const yamlContent = await fallbackResponse.text()
                                console.log(`Fallback loaded config for ${file}:`, yamlContent)
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

        loadFallbackConfigs() {
            this.files.forEach(file => {
                this.fileConfigs[file] = {
                    title: file.replace('.md', '').replace(/-/g, ' '),
                    label: 'Document',
                    lastUpdate: new Date().toISOString()
                }
            })
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
                        let value = line.substring(colonIndex + 1).trim()
                        
                        if (key && value) {
                            // Handle array format: labels: ["tag1", "tag2", "tag3"]
                            if (value.startsWith('[') && value.endsWith(']')) {
                                const arrayContent = value.slice(1, -1).trim()
                                if (arrayContent) {
                                    const arrayItems = arrayContent.split(',').map(item => 
                                        item.trim().replace(/^["']|["']$/g, '')
                                    ).filter(item => item.length > 0)
                                    config[key.toLowerCase()] = arrayItems
                                } else {
                                    config[key.toLowerCase()] = []
                                }
                            } else {
                                // Handle single value
                                config[key.toLowerCase()] = value.replace(/^["']|["']$/g, '')
                            }
                        }
                    }
                }
            })
            
            console.log('Parsed YAML config:', config)
            return config
        },

        generateYAML(title, labels) {
            // Convert comma-delimited string to array
            const labelsArray = typeof labels === 'string' ? 
                labels.split(',').map(label => label.trim()).filter(label => label.length > 0) : 
                labels;
            
            return `# File Configuration
title: "${title}"
labels: [${labelsArray.map(label => `"${label}"`).join(', ')}]
lastUpdate: "${new Date().toISOString()}"
`
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

        async loadTags() {
            try {
                const response = await fetch('/api/tags')
                if (response.ok) {
                    const data = await response.json()
                    this.tags = data.tags || []
                    this.tagStats = data.stats || {}
                    console.log('Tags loaded:', this.tags)
                } else {
                    console.warn('Failed to load tags')
                    this.tags = []
                    this.tagStats = {}
                }
            } catch (error) {
                console.error('Error loading tags:', error)
                this.tags = []
                this.tagStats = {}
            }
        },

        getTagTooltip(tag) {
            const fileText = tag.count > 1 ? 'files' : 'file'
            return `Used in ${tag.count} ${fileText}: ${tag.files.join(', ')}`
        },

        isTagSelected(tagLabel) {
            return this.selectedTags.includes(tagLabel)
        },

        toggleTagFilter(tagLabel) {
            const index = this.selectedTags.indexOf(tagLabel)
            if (index > -1) {
                // Tag is selected, remove it
                this.selectedTags.splice(index, 1)
            } else {
                // Tag is not selected, add it
                this.selectedTags.push(tagLabel)
            }
            this.applyTagFilters()
        },

        applyTagFilters() {
            if (this.selectedTags.length === 0) {
                // No filters, show all files
                this.files = [...this.allFiles]
            } else {
                // Filter files based on selected tags
                this.files = this.allFiles.filter(file => {
                    const fileConfig = this.fileConfigs[file]
                    if (!fileConfig) return false
                    
                    // Handle both single label and labels array
                    let fileLabels = []
                    if (fileConfig.labels && Array.isArray(fileConfig.labels)) {
                        fileLabels = fileConfig.labels
                    } else if (fileConfig.label) {
                        fileLabels = [fileConfig.label]
                    }
                    
                    // Check if any of the file's labels matches any selected tag
                    return this.selectedTags.some(selectedTag => 
                        fileLabels.includes(selectedTag)
                    )
                })
            }
            
            // If current file is no longer visible due to filtering, clear preview
            if (this.currentFile && !this.files.includes(this.currentFile)) {
                this.currentFile = null
                this.renderedContent = ''
                this.isEditing = false
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

            // Load file configuration into form fields
            const config = this.fileConfigs[filename]
            if (config) {
                this.fileTitle = config.title || ''
                
                // Handle both single label and labels array
                if (config.labels && Array.isArray(config.labels)) {
                    this.fileLabels = config.labels.join(', ')
                } else if (config.label) {
                    this.fileLabels = config.label
                } else {
                    this.fileLabels = ''
                }
            }

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

        async duplicateFile(filename) {
            if (this.isEditing) {
                if (!confirm('You have unsaved changes. Do you want to discard them?')) {
                    return
                }
                this.destroyEasyMDE()
            }

            const config = this.fileConfigs[filename]
            const originalTitle = config?.title || filename.replace('.md', '').replace(/-/g, ' ')
            
            // Handle both single label and labels array
            let originalLabels = 'Document'
            if (config?.labels && Array.isArray(config.labels)) {
                originalLabels = config.labels.join(', ')
            } else if (config?.label) {
                originalLabels = config.label
            }

            try {
                // Load the content of the file to duplicate
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

                // Generate suggested filename for duplicate
                const baseName = filename.replace('.md', '')
                const suggestedFilename = `${baseName}-copy.md`

                // Set up for creating a new file with duplicated content
                this.currentFile = null
                this.isEditing = true
                this.editContent = content
                this.newFileName = suggestedFilename
                this.fileTitle = `${originalTitle} (Copy)`
                this.fileLabels = originalLabels

                this.clearMessage()
                this.showMessage(`File "${originalTitle}" loaded for duplication. Modify the details and click "Create File".`, 'info')
                
                this.$nextTick(() => {
                    this.initializeEasyMDE()
                })
            } catch (error) {
                console.error('Error duplicating file:', error)
                this.showMessage(`Error duplicating ${filename}: ${error.message}`, 'error')
            }
        },

        async saveFile() {
            if (!this.currentFile || !this.isEditing) return

            // Validate required fields
            if (!this.fileTitle.trim()) {
                this.showMessage('Please enter a title', 'error')
                return
            }

            if (!this.fileLabels.trim()) {
                this.showMessage('Please enter at least one label', 'error')
                return
            }

            // Get content from EasyMDE editor
            if (this.easyMDE) {
                this.editContent = this.easyMDE.value()
            }

            try {
                // Save markdown file
                const mdResponse = await fetch(`/api/files/${this.currentFile}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: this.editContent })
                })

                if (!mdResponse.ok) {
                    const errorData = await mdResponse.json()
                    throw new Error(errorData.error || 'Failed to save markdown file')
                }

                // Save YAML configuration using new API
                console.log('Attempting to save YAML config via API')
                
                const configResponse = await fetch(`/api/files/${this.currentFile}/config`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        title: this.fileTitle,
                        labels: this.fileLabels 
                    })
                })

                if (!configResponse.ok) {
                    const configError = await configResponse.json()
                    console.error('Failed to save YAML config:', configResponse.status, configError)
                    this.showMessage('Warning: Markdown saved but configuration update failed', 'warning')
                } else {
                    console.log('YAML config saved successfully via new API')
                }

                // Update local config
                const labelsArray = typeof this.fileLabels === 'string' ? 
                    this.fileLabels.split(',').map(label => label.trim()).filter(label => label.length > 0) : 
                    this.fileLabels;
                    
                this.fileConfigs[this.currentFile] = {
                    title: this.fileTitle,
                    labels: labelsArray,
                    lastUpdate: new Date().toISOString()
                }

                const result = await mdResponse.json()
                this.showMessage(`File saved successfully at ${new Date(result.timestamp).toLocaleTimeString()}`, 'success')
                
                // Clear selected tags and reload tags list to reflect any new tags
                this.selectedTags = []
                await this.loadTags()
                this.applyTagFilters()
                
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

            // Validate required fields
            if (!this.fileTitle.trim()) {
                this.showMessage('Please enter a title', 'error')
                return
            }

            if (!this.fileLabels.trim()) {
                this.showMessage('Please enter at least one label', 'error')
                return
            }

            // Get content from EasyMDE editor
            if (this.easyMDE) {
                this.editContent = this.easyMDE.value()
            }

            try {
                // Create markdown file
                const mdResponse = await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, content: this.editContent })
                })

                if (!mdResponse.ok) {
                    const errorData = await mdResponse.json()
                    throw new Error(errorData.error || 'Failed to create file')
                }

                // Create YAML configuration file
                const configFile = filename.replace('.md', '.yaml')
                const yamlContent = this.generateYAML(this.fileTitle, this.fileLabels)
                
                console.log('Attempting to create YAML config:', configFile, yamlContent)
                
                const yamlResponse = await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: configFile, content: yamlContent })
                })

                if (!yamlResponse.ok) {
                    const yamlError = await yamlResponse.text()
                    console.error('Failed to create YAML config:', yamlResponse.status, yamlError)
                    
                    // Try fallback method - direct file creation
                    try {
                        const fallbackResponse = await fetch(`repository/${configFile}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'text/plain' },
                            body: yamlContent
                        })
                        
                        if (fallbackResponse.ok) {
                            console.log('YAML config created via fallback method')
                        } else {
                            throw new Error('Fallback also failed')
                        }
                    } catch (fallbackError) {
                        console.error('Fallback YAML create failed:', fallbackError)
                        this.showMessage('Warning: File created but configuration setup failed', 'warning')
                    }
                } else {
                    console.log('YAML config created successfully')
                }

                // Update YAML config using new API after file creation
                try {
                    const configResponse = await fetch(`/api/files/${filename}/config`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            title: this.fileTitle,
                            labels: this.fileLabels 
                        })
                    })

                    if (!configResponse.ok) {
                        console.error('Failed to update initial config via API')
                    }
                } catch (configError) {
                    console.error('Error updating initial config:', configError)
                }

                // Update local config
                const labelsArray = typeof this.fileLabels === 'string' ? 
                    this.fileLabels.split(',').map(label => label.trim()).filter(label => label.length > 0) : 
                    this.fileLabels;
                    
                this.fileConfigs[filename] = {
                    title: this.fileTitle,
                    labels: labelsArray,
                    lastUpdate: new Date().toISOString()
                }

                const result = await mdResponse.json()
                await this.loadFiles()
                this.showMessage(`File created successfully at ${new Date(result.timestamp).toLocaleTimeString()}`, 'success')
                
                // Clear selected tags and reload tags list to reflect any new tags
                this.selectedTags = []
                await this.loadTags()
                this.applyTagFilters()
                
                this.currentFile = filename
                this.renderedContent = marked.parse(this.editContent)
                this.destroyEasyMDE()
                this.isEditing = false
                this.newFileName = ''
                this.fileTitle = ''
                this.fileLabels = ''
            } catch (error) {
                console.error('Error creating file:', error)
                this.showMessage(`Error creating file: ${error.message}`, 'error')
            }
        },

        async deleteFile(filename) {
            const fileTitle = this.getFileTitle(filename)
            const confirmed = confirm(`Are you sure you want to delete "${fileTitle}" (${filename})?\n\nThis action cannot be undone and will also delete the configuration file.`)
            
            if (!confirmed) return

            try {
                // Delete markdown file
                const mdResponse = await fetch(`/api/files/${filename}`, {
                    method: 'DELETE'
                })

                if (!mdResponse.ok) {
                    const errorData = await mdResponse.json()
                    throw new Error(errorData.error || 'Failed to delete file')
                }

                // Try to delete YAML configuration file
                const configFile = filename.replace('.md', '.yaml')
                try {
                    await fetch(`/api/files/${configFile}`, {
                        method: 'DELETE'
                    })
                } catch (configError) {
                    console.warn('Could not delete YAML config file:', configError)
                }

                // Remove from local config
                delete this.fileConfigs[filename]

                // If deleted file was currently selected, clear preview
                if (this.currentFile === filename) {
                    this.currentFile = null
                    this.isEditing = false
                    this.renderedContent = ''
                }

                await this.loadFiles()
                this.showMessage(`"${fileTitle}" deleted successfully`, 'success')
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
            this.fileTitle = ''
            this.fileLabels = ''
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
                this.fileTitle = ''
                this.fileLabels = ''
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
