/**
 * Project:   Orchea - Modular Documentation System
 * File:      NewDocumentContent.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Vue.js component for creating new documents with drag-and-drop file selection,
 *   YAML configuration generation, and dynamic repository file management.
 *
 * License: MIT
 */

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
                        <div class="form-section content-selection-container">
                            <h4>Content Structure</h4>
                            <p class="section-description">Click on repository files to select/deselect them for your document:</p>
                            
                            <div class="content-selection-grid">
                                <div class="file-selection-panel">
                                    <div class="panel-header">
                                        Available Repository Files
                                        <span class="file-count">{{ availableFiles.length }} files</span>
                                    </div>
                                    
                                    <!-- Search Box -->
                                    <div class="search-container">
                                        <div class="search-input-wrapper">
                                            <i class="fas fa-search search-icon"></i>
                                            <input 
                                                type="text" 
                                                v-model="searchQuery"
                                                @input="performSearch"
                                                class="search-input"
                                                placeholder="Search files by content, title, or labels..."
                                                maxlength="100"
                                            >
                                            <button 
                                                v-if="searchQuery" 
                                                @click="clearSearch"
                                                class="search-clear-btn"
                                                title="Clear search"
                                            >
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <div v-if="isSearching" class="search-status">
                                            <i class="fas fa-spinner fa-spin"></i>
                                            Searching...
                                        </div>
                                        <div v-else-if="searchQuery && searchResults !== null" class="search-status">
                                            Found {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}
                                            <span v-if="searchHasMore"> (showing first {{ searchResults.length }})</span>
                                        </div>
                                    </div>
                                    
                                    <div class="file-selection-list">
                                        <div v-if="isLoadingFiles" class="loading-indicator">
                                            <div class="loading-icon">
                                                <i class="fas fa-spinner fa-spin"></i>
                                            </div>
                                            <div class="loading-text">
                                                Loading repository files...
                                            </div>
                                        </div>
                                        <div v-else-if="availableFiles.length === 0" class="no-files">
                                            <div class="empty-icon">
                                                <i class="fas fa-folder-open"></i>
                                            </div>
                                            <div class="empty-text">
                                                <h4>No Files Found</h4>
                                                <p>No markdown files found in repository</p>
                                            </div>
                                        </div>
                                        <div 
                                            v-else
                                            v-for="file in availableFiles" 
                                            :key="file"
                                            class="file-selection-item"
                                            :class="{ 'selected': isFileSelected(file) }"
                                            @click="previewFileOnly(file)"
                                            @dblclick="toggleFileSelection(file)"
                                        >
                                            <span class="file-icon">
                                                <i class="fas fa-file-alt" style="color: #667eea;"></i>
                                            </span>
                                            <span class="file-checkbox-icon" :class="{ 'selected': isFileSelected(file), 'unselected': !isFileSelected(file) }">
                                                <i v-if="isFileSelected(file)" class="fas fa-check-square" style="color: #28a745;"></i>
                                                <i v-else class="far fa-square" style="color: #dee2e6;"></i>
                                            </span>
                                            <span class="file-name-display">{{ getFileTitle(file) }}</span>
                                            <span v-if="isFileSelected(file)" class="file-order" style="color: #28a745;">#{{ getFileOrder(file) }}</span>
                                            <span v-if="lastSelectedFile === file && !isFileSelected(file)" class="file-status" style="color: #667eea;">
                                                <i class="fas fa-eye"></i>
                                            </span>
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
                                            <div class="preview-icon">
                                                <i class="fas fa-file-alt"></i>
                                            </div>
                                            <div class="preview-text">
                                                <h4>No File Selected</h4>
                                                <p>Select a file to preview its content</p>
                                            </div>
                                        </div>
                                        <div v-else-if="isLoadingPreview" class="loading-preview">
                                            <div class="loading-icon">
                                                <i class="fas fa-spinner fa-spin"></i>
                                            </div>
                                            <div class="loading-text">
                                                Loading preview for {{ lastSelectedFile }}...
                                            </div>
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
                                                    <i class="fas fa-tags"></i>
                                                    <div class="tags-container" v-if="fileConfigs[lastSelectedFile].labels && Array.isArray(fileConfigs[lastSelectedFile].labels)">
                                                        <span v-for="(label, index) in fileConfigs[lastSelectedFile].labels" :key="index" class="tag-pill">
                                                            {{ label }}
                                                        </span>
                                                    </div>
                                                    <span class="label-text" v-else-if="fileConfigs[lastSelectedFile].label">{{ fileConfigs[lastSelectedFile].label }}</span>
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

                        <!-- Form Actions -->
                        <div class="form-actions">
                            <div class="form-actions-left">
                                <button 
                                    type="submit" 
                                    class="btn btn-primary btn-lg"
                                    :disabled="!isFormValid || isCreating"
                                    :class="{ 'btn-loading': isCreating }"
                                >
                                    <span v-if="isCreating"><i class="fas fa-sync fa-spin"></i> Creating Document...</span>
                                    <span v-else><i class="fas fa-plus"></i> Create Document</span>
                                </button>
                                
                                <button 
                                    type="button" 
                                    class="btn btn-secondary btn-lg"
                                    @click="resetForm"
                                    :disabled="isCreating"
                                >
                                    <i class="fas fa-undo"></i> Reset Form
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Status Messages -->
            <div v-if="message" 
                 class="status-message" 
                 :class="'status-' + messageType"
                 @click="clearMessage"
            >
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
            allAvailableFiles: [], // Store all files for filtering
            fileConfigs: {},
            tags: [],
            tagStats: {},
            selectedTags: [], // Track selected tag filters
            searchQuery: '',
            searchResults: null,
            isSearching: false,
            searchHasMore: false,
            searchDebounceTimer: null,
            isLoadingFiles: false,
            isCreating: false,
            showPreview: false,
            message: '',
            messageType: 'success',
            
            // Preview functionality
            lastSelectedFile: null,
            currentFilePreview: '',
            isLoadingPreview: false,
            finalDocumentPreview: '',
            isLoadingFinalPreview: false,
            
            // Drag and drop state
            draggedFileIndex: null,
            isDragging: false
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
        await this.loadFileConfigs()
        await this.loadTags()
        // Apply any existing filters
        this.applyTagFilters()
        // Generate final preview if files are already selected
        if (this.documentConfig.markdown_files.length > 0) {
            this.generateFinalPreview()
        }
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
                
                this.allAvailableFiles = availableFiles.filter(file => file.endsWith('.md'))
                this.availableFiles = [...this.allAvailableFiles] // Display all files initially
                
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
            await this.loadFileConfigs()
            this.showMessage(`Refreshed! Found ${this.availableFiles.length} available files.`, 'success')
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
            // Don't apply tag filters if search is active
            if (this.searchQuery.trim()) {
                return
            }
            
            if (this.selectedTags.length === 0) {
                // No filters, show all files
                this.availableFiles = [...this.allAvailableFiles]
            } else {
                // Filter files based on selected tags
                this.availableFiles = this.allAvailableFiles.filter(file => {
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
            
            // If current selected file is no longer visible due to filtering, clear preview
            if (this.lastSelectedFile && !this.availableFiles.includes(this.lastSelectedFile)) {
                this.lastSelectedFile = null
                this.currentFilePreview = ''
            }
        },

        // Search functionality
        performSearch() {
            // Clear previous timeout
            if (this.searchDebounceTimer) {
                clearTimeout(this.searchDebounceTimer)
            }
            
            // Debounce search to avoid too many API calls
            this.searchDebounceTimer = setTimeout(() => {
                this.executeSearch()
            }, 300) // 300ms delay
        },

        async executeSearch() {
            const query = this.searchQuery.trim()
            
            if (!query) {
                this.clearSearch()
                return
            }
            
            this.isSearching = true
            
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`)
                
                if (!response.ok) {
                    throw new Error('Search request failed')
                }
                
                const data = await response.json()
                
                this.searchResults = data.results || []
                this.searchHasMore = data.hasMore || false
                
                // Update file list with search results
                if (this.searchResults.length > 0) {
                    this.availableFiles = this.searchResults.map(result => result.filename)
                } else {
                    this.availableFiles = [] // No results found
                }
                
                console.log(`Search for "${query}" returned ${this.searchResults.length} results`)
                
            } catch (error) {
                console.error('Search error:', error)
                this.showMessage('Search failed: ' + error.message, 'error')
                this.availableFiles = [] // Show no files on error
            } finally {
                this.isSearching = false
            }
        },

        clearSearch() {
            this.searchQuery = ''
            this.searchResults = null
            this.searchHasMore = false
            this.isSearching = false
            
            // Clear any pending search
            if (this.searchDebounceTimer) {
                clearTimeout(this.searchDebounceTimer)
                this.searchDebounceTimer = null
            }
            
            // Restore original file list with current filters
            this.applyTagFilters()
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
                this.currentFilePreview = `<div style="color: red;">Error loading ${fileName}: ${error.message}</div>`
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
                        combinedContent += `\n\n**Error loading ${fileName}**: ${error.message}\n\n`
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
            this.lastSelectedFile = null
            this.currentFilePreview = ''
            this.finalDocumentPreview = ''
            this.clearMessage()
        },

        showMessage(message, type = 'info') {
            this.message = message
            this.messageType = type
            setTimeout(() => {
                this.message = ''
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

        clearMessage() {
            this.message = ''
        }
    }
}
