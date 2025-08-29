// Documents Content Component
const DocumentsContent = {
    template: `
        <div class="documents-content">
            <section class="documents-header">
                <h2>Document Gallery</h2>
                <p>Browse and manage your generated documents from modular Markdown snippets.</p>
            </section>

            <section class="documents-section">
                <div class="documents-grid">
                    <div class="document-card sample-document">
                        <div class="document-icon">📄</div>
                        <div class="document-info">
                            <h3>Sample Document</h3>
                            <p>A demonstration document showing how Orchea combines Markdown snippets into a complete document.</p>
                            <div class="document-meta">
                                <span class="document-date">Last updated: Aug 29, 2025</span>
                                <span class="document-status">✅ Complete</span>
                            </div>
                        </div>
                        <div class="document-actions">
                            <a href="documents/sample-document/" class="btn btn-primary btn-sm">View Document</a>
                            <button class="btn btn-secondary btn-sm" @click="editDocument('sample-document')">Edit Config</button>
                            <button class="btn btn-info btn-sm" @click="previewDocument('sample-document')">Quick Preview</button>
                        </div>
                    </div>

                    <div class="document-card new-document" @click="createNewDocument">
                        <div class="document-icon">➕</div>
                        <div class="document-info">
                            <h3>Create New Document</h3>
                            <p>Start a new document by selecting Markdown snippets from the repository.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="how-it-works">
                <h3>How Documents Work</h3>
                <div class="steps-container">
                    <div class="step-item">
                        <div class="step-icon">1️⃣</div>
                        <h4>Create Configuration</h4>
                        <p>Define your document structure using a YAML configuration file.</p>
                    </div>
                    <div class="step-item">
                        <div class="step-icon">2️⃣</div>
                        <h4>Select Snippets</h4>
                        <p>Choose which Markdown files from the repository to include.</p>
                    </div>
                    <div class="step-item">
                        <div class="step-icon">3️⃣</div>
                        <h4>Generate Document</h4>
                        <p>Orchea automatically combines snippets into a complete document.</p>
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
            try {
                // In a real implementation, this would fetch from an API
                // For now, we'll simulate with known documents
                this.documents = [
                    {
                        name: 'sample-document',
                        title: 'Sample Document',
                        description: 'A demonstration document showing how Orchea works',
                        lastUpdated: new Date().toISOString(),
                        status: 'complete'
                    }
                ]
            } catch (error) {
                console.error('Error loading documents:', error)
                this.showMessage('Error loading documents', 'error')
            } finally {
                this.isLoading = false
            }
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
