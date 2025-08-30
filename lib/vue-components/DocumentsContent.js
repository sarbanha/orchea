// Documents Content Component
const DocumentsContent = {
    template: `
        <div class="documents-content">
            <!-- Hero Section -->
            <section class="documents-hero">
                <h2>📚 Document Library</h2>
                <p>Browse, view, and manage your documentation collection. Documents are dynamically assembled from repository snippets using YAML configuration files.</p>
            </section>

            <!-- Document Selector and Viewer -->
            <section class="document-viewer">
                <div class="document-selector-box">
                    <h3>📖 Document Viewer</h3>
                    <div class="selector-container">
                        <label for="document-select">Select a document to view:</label>
                        <select id="document-select" v-model="selectedDocument" @change="loadSelectedDocument" class="document-dropdown">
                            <option value="">-- Choose a document --</option>
                            <option v-for="doc in availableDocuments" :key="doc.name" :value="doc.name">
                                {{ doc.title }} ({{ doc.name }})
                            </option>
                        </select>
                    </div>
                    
                    <div class="document-content-viewer" v-if="selectedDocumentContent">
                        <div class="document-header">
                            <h2 class="document-title">{{ selectedDocumentTitle }}</h2>
                            <div class="document-meta-info">
                                <span class="meta-item" v-if="selectedDocumentDate">
                                    📅 {{ selectedDocumentDate }}
                                </span>
                                <span class="meta-item" v-if="selectedDocumentVersion">
                                    🏷️ Version {{ selectedDocumentVersion }}
                                </span>
                            </div>
                        </div>
                        <div class="document-content" v-html="selectedDocumentContent"></div>
                        <div class="document-actions-inline">
                            <a :href="'documents/' + selectedDocument + '/'" class="btn btn-primary btn-sm" target="_blank">
                                🔗 Open Full Document
                            </a>
                            <button class="btn btn-secondary btn-sm" @click="editDocument(selectedDocument)">
                                ⚙️ Edit Configuration
                            </button>
                        </div>
                    </div>
                    
                    <div class="no-document-selected" v-else>
                        <div class="placeholder-content">
                            <div class="placeholder-icon">📄</div>
                            <p>Select a document from the dropdown above to view its content</p>
                        </div>
                    </div>
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
            documents: [],
            availableDocuments: [],
            selectedDocument: '',
            selectedDocumentContent: '',
            selectedDocumentTitle: '',
            selectedDocumentDate: '',
            selectedDocumentVersion: '',
            selectedDocumentStatus: 'complete',
            documentSourceFiles: [],
            isLoading: false,
            message: '',
            messageType: 'success'
        }
    },
    async mounted() {
        await this.loadDocuments()
    },
    methods: {
        async loadDocuments() {
            this.isLoading = true
            console.log('Loading documents...')
            
            try {
                // Try to fetch the list of documents from the documents directory
                let documentsFound = []
                
                try {
                    // First, try to get documents via API if available
                    console.log('Trying to fetch from /api/documents...')
                    const apiResponse = await fetch('/api/documents')
                    console.log('API response status:', apiResponse.status)
                    
                    if (apiResponse.ok) {
                        const data = await apiResponse.json()
                        documentsFound = data.documents || []
                        console.log('Documents from API:', documentsFound)
                    } else {
                        throw new Error(`API responded with status ${apiResponse.status}`)
                    }
                } catch (apiError) {
                    console.log('API not available, scanning documents directory directly...', apiError.message)
                    
                    // Fallback: try to get documents by checking what actually exists in the documents directory
                    // Since we can't directly read directories in the browser, we'll try the known documents
                    // and also some documents that might have been created
                    const possibleDocuments = [
                        'sample-document',
                        'test-test', // Known to exist
                        'getting-started-guide', 
                        'api-documentation',
                        'user-manual',
                        'installation-guide',
                        'troubleshooting',
                        'faq',
                        'user-guide',
                        'quick-start',
                        'tutorial',
                        'reference'
                    ]
                    
                    console.log('Checking for documents:', possibleDocuments)
                    
                    // Check which documents actually exist by trying to fetch their config files
                    for (const docName of possibleDocuments) {
                        try {
                            const configUrl = `documents/${docName}/config.yaml`
                            console.log(`Checking: ${configUrl}`)
                            const configResponse = await fetch(configUrl)
                            if (configResponse.ok) {
                                const yamlContent = await configResponse.text()
                                const config = this.parseYAML(yamlContent)
                                
                                documentsFound.push({
                                    name: docName,
                                    title: this.extractDocumentTitle(docName, config),
                                    lastUpdated: config?.date || 'Unknown',
                                    status: config?.status || 'complete',
                                    version: config?.version || '1.0'
                                })
                                console.log(`Found document: ${docName} - ${config?.document_title || config?.title}`)
                            }
                        } catch (error) {
                            // Document doesn't exist, skip it
                            console.log(`Document ${docName} not found`)
                            continue
                        }
                    }
                }
                
                console.log('Total documents found:', documentsFound.length)
                
                // Update both arrays with found documents
                this.documents = documentsFound
                this.availableDocuments = documentsFound.map(doc => ({
                    name: doc.name || doc.slug,
                    title: doc.title,
                    lastUpdated: this.formatDate(doc.lastUpdated || doc.date),
                    status: doc.status || 'complete'
                }))
                
                // If no documents found, show a message
                if (this.availableDocuments.length === 0) {
                    console.log('No documents found')
                    this.showMessage('No documents found. Create your first document using the "New Document" page!', 'info')
                } else {
                    console.log('Available documents:', this.availableDocuments)
                }
                
            } catch (error) {
                console.error('Error loading documents:', error)
                this.showMessage('Error loading documents: ' + error.message, 'error')
                
                // Emergency fallback - at least show sample document if it exists
                this.availableDocuments = [{
                    name: 'sample-document',
                    title: 'Sample Document',
                    lastUpdated: 'Aug 29, 2025',
                    status: 'complete'
                }]
            } finally {
                this.isLoading = false
            }
        },

        extractDocumentTitle(documentName, config) {
            // Try to get title from config, prioritizing document_title over title
            if (config && config.document_title) {
                return config.document_title
            }
            
            if (config && config.title) {
                return config.title
            }
            
            // Generate title from document name
            return documentName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        },

        formatDate(dateString) {
            try {
                if (!dateString || dateString === 'Unknown') return 'Unknown'
                
                // If it's already in a nice format, return as is
                if (dateString.includes('Aug') || dateString.includes('Sep') || dateString.includes('Oct')) {
                    return dateString
                }
                
                // Try to parse and format the date
                const date = new Date(dateString)
                if (isNaN(date.getTime())) return dateString
                
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })
            } catch (error) {
                return dateString || 'Unknown'
            }
        },

        async loadSelectedDocument() {
            if (!this.selectedDocument) {
                this.selectedDocumentContent = ''
                this.documentSourceFiles = []
                return
            }

            this.isLoading = true
            this.selectedDocumentContent = '<div class="loading-indicator">📄 Loading document configuration and assembling content...</div>'
            this.documentSourceFiles = []
            
            try {
                // Find the document info from our dynamically loaded list
                const docInfo = this.availableDocuments.find(doc => doc.name === this.selectedDocument)
                if (docInfo) {
                    this.selectedDocumentTitle = docInfo.title
                    this.selectedDocumentDate = docInfo.lastUpdated
                    this.selectedDocumentStatus = docInfo.status
                }

                // Load document content by parsing YAML config and collating snippets
                console.log(`Starting document assembly for: ${this.selectedDocument}`)
                const result = await this.getDocumentContent(this.selectedDocument)
                
                // Set document metadata from config
                if (result.config) {
                    this.selectedDocumentTitle = result.config.document_title || result.config.title || this.selectedDocumentTitle
                    this.selectedDocumentDate = result.config.date || this.selectedDocumentDate
                    this.selectedDocumentVersion = result.config.version || '1.0'
                    this.selectedDocumentStatus = result.config.status || 'complete'
                }
                
                this.selectedDocumentContent = this.renderMarkdown(result.content)
                this.documentSourceFiles = result.sourceFiles || []
                
                // Show appropriate success/warning message
                const fileCount = this.documentSourceFiles.length
                const failedCount = result.failedFiles ? result.failedFiles.length : 0
                
                if (result.error) {
                    this.showMessage(`⚠️ Document loaded with errors: ${result.error}`, 'error')
                } else if (failedCount > 0) {
                    this.showMessage(`⚠️ Document "${this.selectedDocumentTitle}" assembled from ${fileCount} snippets (${failedCount} files failed to load)`, 'info')
                } else {
                    this.showMessage(`✅ Document "${this.selectedDocumentTitle}" successfully assembled from ${fileCount} repository snippet${fileCount !== 1 ? 's' : ''}!`, 'success')
                }
                
                // Log the assembly results
                console.log(`Document assembly complete:`, {
                    document: this.selectedDocument,
                    sourceFiles: this.documentSourceFiles,
                    failedFiles: result.failedFiles,
                    hasConfig: !!result.config
                })
                
            } catch (error) {
                console.error('Error loading document content:', error)
                this.selectedDocumentContent = `<div class="error">
                    <h3>Error Loading Document</h3>
                    <p><strong>Document:</strong> ${this.selectedDocument}</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Please check that the document exists and has a valid configuration file.</p>
                </div>`
                this.documentSourceFiles = []
                this.showMessage(`❌ Failed to load "${this.selectedDocument}": ${error.message}`, 'error')
            } finally {
                this.isLoading = false
            }
        },

        async getDocumentContent(documentName) {
            try {
                console.log(`Loading document: ${documentName}`)
                
                // Always try to fetch the YAML configuration first
                const configResponse = await fetch(`documents/${documentName}/config.yaml`)
                
                if (!configResponse.ok) {
                    throw new Error(`Configuration file not found for ${documentName} (HTTP ${configResponse.status})`)
                }
                
                const yamlContent = await configResponse.text()
                console.log(`YAML content loaded for ${documentName}:`, yamlContent)
                
                const config = this.parseYAML(yamlContent)
                console.log(`Parsed YAML config:`, config)
                
                if (!config) {
                    throw new Error(`Invalid YAML configuration for ${documentName}`)
                }
                
                if (!config.markdown_files || !Array.isArray(config.markdown_files)) {
                    throw new Error(`No markdown_files array found in configuration for ${documentName}`)
                }
                
                // Build the document by collating markdown snippets
                let combinedContent = ''
                const sourceFiles = []
                const failedFiles = []
                
                // Fetch and combine each markdown file specified in the configuration
                console.log(`Loading ${config.markdown_files.length} markdown files...`)
                
                for (const filename of config.markdown_files) {
                    console.log(`Fetching: ${filename}`)
                    
                    try {
                        let fileContent = ''
                        let fileLoaded = false
                        
                        // Try multiple methods to fetch the file content
                        // Method 1: Try API endpoint
                        try {
                            const apiResponse = await fetch(`/api/files/${filename}`)
                            if (apiResponse.ok) {
                                const data = await apiResponse.json()
                                fileContent = data.content
                                fileLoaded = true
                                console.log(`✓ Loaded ${filename} via API`)
                            }
                        } catch (apiError) {
                            console.log(`API failed for ${filename}, trying direct access...`)
                        }
                        
                        // Method 2: Try direct repository access
                        if (!fileLoaded) {
                            try {
                                const directResponse = await fetch(`repository/${filename}`)
                                if (directResponse.ok) {
                                    fileContent = await directResponse.text()
                                    fileLoaded = true
                                    console.log(`✓ Loaded ${filename} via direct access`)
                                }
                            } catch (directError) {
                                console.log(`Direct access failed for ${filename}`)
                            }
                        }
                        
                        if (fileLoaded && fileContent.trim()) {
                            combinedContent += fileContent.trim() + '\n\n'
                            sourceFiles.push(filename)
                        } else {
                            const errorMsg = `*⚠️ Warning: Could not load content from ${filename}*`
                            combinedContent += errorMsg + '\n\n'
                            failedFiles.push(filename)
                            console.warn(`Failed to load: ${filename}`)
                        }
                        
                    } catch (fileError) {
                        console.error(`Error loading ${filename}:`, fileError)
                        const errorMsg = `*❌ Error loading ${filename}: ${fileError.message}*`
                        combinedContent += errorMsg + '\n\n'
                        failedFiles.push(filename)
                    }
                }
                
                console.log(`✓ Document assembly complete. Loaded: ${sourceFiles.length}, Failed: ${failedFiles.length}`)
                
                return {
                    content: combinedContent,
                    sourceFiles: sourceFiles,
                    config: config,
                    failedFiles: failedFiles
                }
                
            } catch (error) {
                console.error('Error in getDocumentContent:', error)
                
                // Return error information with fallback
                return {
                    content: `# ${documentName}\n\n**⚠️ Configuration Error**\n\n${error.message}\n\n---\n\n*Falling back to static content...*\n\n` + 
                             this.getStaticDocumentContent(documentName).content,
                    sourceFiles: ['error-fallback'],
                    config: null,
                    error: error.message
                }
            }
        },

        parseYAML(yamlString) {
            try {
                console.log('Parsing YAML:', yamlString)
                
                const lines = yamlString.split('\n')
                const result = {}
                let currentArray = null
                let currentKey = null
                let indentLevel = 0
                
                for (let line of lines) {
                    const originalLine = line
                    line = line.trim()
                    
                    // Skip empty lines and comments
                    if (!line || line.startsWith('#')) continue
                    
                    // Detect indentation level
                    const leadingSpaces = originalLine.length - originalLine.trimLeft().length
                    
                    if (line.includes(':') && !line.startsWith('-')) {
                        const colonIndex = line.indexOf(':')
                        const key = line.substring(0, colonIndex).trim()
                        const value = line.substring(colonIndex + 1).trim()
                        
                        if (value) {
                            // Simple key-value pair
                            result[key] = value.replace(/['"]/g, '')
                            currentArray = null
                            currentKey = null
                        } else {
                            // This is likely an array or object key
                            currentKey = key
                            currentArray = []
                            result[key] = currentArray
                        }
                    } else if (line.startsWith('-') && currentArray !== null) {
                        // Array item
                        const value = line.substring(1).trim()
                        currentArray.push(value)
                    }
                }
                
                console.log('Parsed YAML result:', result)
                return result
                
            } catch (error) {
                console.error('Error parsing YAML:', error)
                console.error('YAML content was:', yamlString)
                return null
            }
        },

        getStaticDocumentContent(documentName) {
            // Fallback static content for demo purposes
            const documentContents = {
                'sample-document': {
                    content: `# Sample Document

*This document uses static fallback content - YAML configuration not found*

---

## Introduction

Welcome to Orchea! This system allows you to create beautiful documentation by combining reusable Markdown snippets.

## Features

- **Modular Content**: Reuse snippets across multiple documents
- **YAML Configuration**: Simple configuration files
- **Dynamic Assembly**: Automatic content combination
- **Beautiful Rendering**: Custom styling and responsive design

## Getting Started

1. Create your Markdown snippets in the repository
2. Configure your document using YAML
3. Generate and view your complete document

*This content is statically defined as a fallback.*`,
                    sourceFiles: ['fallback-content']
                },

                'getting-started-guide': {
                    content: `# Getting Started Guide

*This document uses static fallback content*

---

## Prerequisites

- Node.js (v14 or higher)
- npm package manager
- Basic knowledge of Markdown and YAML

## Installation

\`\`\`bash
npm install
npm start
\`\`\`

## Your First Document

1. Navigate to the Repository section
2. Create new Markdown snippets
3. Configure your document structure
4. View the generated result

## Next Steps

- Explore the sample document
- Create your own content snippets
- Experiment with different configurations`,
                    sourceFiles: ['static-getting-started']
                },

                'api-documentation': {
                    content: `# API Documentation

*This document uses static fallback content*

---

## Overview

The Orchea API provides endpoints for managing documents and content snippets.

## Endpoints

### Files API

\`GET /api/files\` - List all files
\`POST /api/files\` - Create new file
\`PUT /api/files/:filename\` - Update file
\`DELETE /api/files/:filename\` - Delete file

### Documents API

\`GET /api/documents\` - List all documents
\`POST /api/documents\` - Create new document

## Authentication

*Authentication details coming soon...*

## Rate Limiting

*Rate limiting information coming soon...*

**Note: This API documentation is still in draft status.**`,
                    sourceFiles: ['static-api-docs']
                }
            }

            return documentContents[documentName] || {
                content: `# ${documentName}\n\nContent for this document is not yet available.`,
                sourceFiles: []
            }
        },

        renderMarkdown(markdown) {
            let html = markdown

            // Headers
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

            // Bold and italic
            html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')

            // Code blocks
            html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            html = html.replace(/`([^`]*)`/gim, '<code>$1</code>')

            // Lists
            html = html.replace(/^\d+\.\s(.*)$/gim, '<li>$1</li>')
            html = html.replace(/^-\s(.*)$/gim, '<li>$1</li>')
            
            // Wrap consecutive list items
            html = html.replace(/(<li>.*?<\/li>)/gims, function(match) {
                return '<ul>' + match + '</ul>'
            })

            // Paragraphs
            html = html.replace(/\n\n/gim, '</p><p>')
            html = '<p>' + html + '</p>'

            // Clean up
            html = html.replace(/<p><\/p>/gim, '')
            html = html.replace(/<p>(<h[1-6]>)/gim, '$1')
            html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1')
            html = html.replace(/<p>(<pre>|<ul>)/gim, '$1')
            html = html.replace(/(<\/pre>|<\/ul>)<\/p>/gim, '$1')

            return html
        },

        createNewDocument() {
            this.showMessage('Document creation feature coming soon!', 'info')
        },

        editDocument(documentName) {
            this.showMessage(`Document configuration editor for "${documentName}" coming soon!`, 'info')
        },

        previewDocument(documentName) {
            this.showMessage(`Quick preview for "${documentName}" - opening in new window...`, 'info')
            // In a real implementation, this could open a modal or redirect
            setTimeout(() => {
                window.open(`documents/${documentName}/`, '_blank')
            }, 1000)
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
