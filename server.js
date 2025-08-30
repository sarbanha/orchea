const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get list of files in repository
app.get('/api/files', async (req, res) => {
    try {
        const repositoryPath = path.join(__dirname, 'repository');
        const files = await fs.readdir(repositoryPath);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        res.json({ files: markdownFiles });
    } catch (error) {
        console.error('Error reading repository:', error);
        res.status(500).json({ error: 'Failed to read repository' });
    }
});

// Get content of a specific file
app.get('/api/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Security check: only allow .md files and prevent path traversal
        if (!filename.endsWith('.md') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        const filePath = path.join(__dirname, 'repository', filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.json({ content, filename });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'File not found' });
        } else {
            console.error('Error reading file:', error);
            res.status(500).json({ error: 'Failed to read file' });
        }
    }
});

// Save content to a specific file
app.put('/api/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { content } = req.body;

        // Security check: only allow .md files and prevent path traversal
        if (!filename.endsWith('.md') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        if (typeof content !== 'string') {
            return res.status(400).json({ error: 'Content must be a string' });
        }

        const filePath = path.join(__dirname, 'repository', filename);
        
        // Create backup of original file
        try {
            const originalContent = await fs.readFile(filePath, 'utf8');
            const backupPath = path.join(__dirname, 'repository', `.${filename}.backup`);
            await fs.writeFile(backupPath, originalContent, 'utf8');
        } catch (backupError) {
            console.log('No existing file to backup or backup failed:', backupError.message);
        }

        // Save the new content
        await fs.writeFile(filePath, content, 'utf8');
        
        console.log(`File saved: ${filename}`);
        res.json({ 
            success: true, 
            message: 'File saved successfully',
            filename,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// Create a new file
app.post('/api/files', async (req, res) => {
    try {
        const { filename, content = '' } = req.body;

        // Security check: only allow .md files and prevent path traversal
        if (!filename || !filename.endsWith('.md') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        const filePath = path.join(__dirname, 'repository', filename);
        
        // Check if file already exists
        try {
            await fs.access(filePath);
            return res.status(409).json({ error: 'File already exists' });
        } catch (error) {
            // File doesn't exist, which is what we want
        }

        await fs.writeFile(filePath, content, 'utf8');
        
        console.log(`New file created: ${filename}`);
        res.json({ 
            success: true, 
            message: 'File created successfully',
            filename,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating file:', error);
        res.status(500).json({ error: 'Failed to create file' });
    }
});

// Delete a file
app.delete('/api/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;

        // Security check: only allow .md files and prevent path traversal
        if (!filename.endsWith('.md') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        const filePath = path.join(__dirname, 'repository', filename);
        await fs.unlink(filePath);
        
        console.log(`File deleted: ${filename}`);
        res.json({ 
            success: true, 
            message: 'File deleted successfully',
            filename
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'File not found' });
        } else {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
});

// Create a new document
app.post('/api/documents', async (req, res) => {
    console.log('POST /api/documents called with body:', req.body);
    
    try {
        const { slug, title, version, date, markdown_files } = req.body;

        // Validate required fields
        if (!slug || !title || !version || !date || !Array.isArray(markdown_files)) {
            return res.status(400).json({ error: 'Missing required fields: slug, title, version, date, markdown_files' });
        }

        // Security check: ensure slug is kebab-case and safe
        const kebabSlug = slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            .substring(0, 64); // Limit to 64 characters

        if (!kebabSlug || kebabSlug.includes('..') || kebabSlug.includes('/')) {
            return res.status(400).json({ error: 'Invalid slug format' });
        }

        const documentPath = path.join(__dirname, 'documents', kebabSlug);
        
        // Check if document already exists
        try {
            await fs.access(documentPath);
            return res.status(409).json({ error: 'Document already exists' });
        } catch (error) {
            // Document doesn't exist, which is what we want
        }

        // Create directory
        await fs.mkdir(documentPath, { recursive: true });

        // Generate YAML config content
        const yamlContent = `document_title: "${title}"
version: "${version}"
date: "${date}"
markdown_files:
${markdown_files.map(file => `  - ${file}`).join('\n')}
`;

        // Generate index.html content
        const indexHtmlContent = `<!DOCTYPE html>
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
</html>`;

        // Write config.yaml file
        const configPath = path.join(documentPath, 'config.yaml');
        await fs.writeFile(configPath, yamlContent, 'utf8');

        // Write index.html file
        const indexPath = path.join(documentPath, 'index.html');
        await fs.writeFile(indexPath, indexHtmlContent, 'utf8');

        console.log(`Document created: ${kebabSlug}`);
        res.json({
            success: true,
            message: 'Document created successfully',
            slug: kebabSlug,
            path: `documents/${kebabSlug}`,
            files: ['config.yaml', 'index.html']
        });

    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

// Get list of documents
app.get('/api/documents', async (req, res) => {
    try {
        const documentsPath = path.join(__dirname, 'documents');
        
        // Check if documents directory exists
        try {
            await fs.access(documentsPath);
        } catch (error) {
            // Documents directory doesn't exist, return empty array
            return res.json({ documents: [] });
        }

        const entries = await fs.readdir(documentsPath, { withFileTypes: true });
        const documents = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const configPath = path.join(documentsPath, entry.name, 'config.yaml');
                try {
                    const configContent = await fs.readFile(configPath, 'utf8');
                    // Parse basic info from YAML (simple parsing)
                    const titleMatch = configContent.match(/document_title:\s*"([^"]+)"/);
                    const versionMatch = configContent.match(/version:\s*"([^"]+)"/);
                    const dateMatch = configContent.match(/date:\s*"([^"]+)"/);
                    
                    documents.push({
                        slug: entry.name,
                        title: titleMatch ? titleMatch[1] : entry.name,
                        version: versionMatch ? versionMatch[1] : '1.0',
                        date: dateMatch ? dateMatch[1] : 'Unknown',
                        path: `documents/${entry.name}`
                    });
                } catch (configError) {
                    // If config.yaml doesn't exist or can't be read, skip this document
                    console.warn(`Warning: Could not read config for document ${entry.name}`);
                }
            }
        }

        res.json({ documents });
    } catch (error) {
        console.error('Error reading documents:', error);
        res.status(500).json({ error: 'Failed to read documents' });
    }
});

// Serve static files from current directory (after API routes)
app.use(express.static('./'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Orchea Documentation System API is running'
    });
});

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log('🌺 Orchea Documentation System');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📁 Repository path: ${path.join(__dirname, 'repository')}`);
    console.log(`🔧 API endpoints:`);
    console.log(`   GET    /api/files           - List all files`);
    console.log(`   GET    /api/files/:filename - Get file content`);
    console.log(`   PUT    /api/files/:filename - Save file content`);
    console.log(`   POST   /api/files           - Create new file`);
    console.log(`   DELETE /api/files/:filename - Delete file`);
    console.log(`   POST   /api/documents       - Create new document`);
    console.log(`   GET    /api/documents       - List all documents`);
    console.log(`🌐 Open http://localhost:${PORT} to view the application`);
    console.log('🔄 Press Ctrl+C to stop the server');
    console.log('-'.repeat(60));
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log('💡 Trying to find an available port...');
        
        // Try ports 3001, 3002, 3003, etc.
        let altPort = 3001;
        const tryPort = () => {
            const altServer = app.listen(altPort, () => {
                console.log(`🌺 Orchea Documentation System`);
                console.log(`📡 Server running on http://localhost:${altPort} (alternative port)`);
                console.log(`🌐 Open http://localhost:${altPort} to view the application`);
                console.log('-'.repeat(60));
            });
            
            altServer.on('error', (altErr) => {
                if (altErr.code === 'EADDRINUSE') {
                    altPort++;
                    if (altPort <= 3010) {
                        tryPort();
                    } else {
                        console.error('❌ Could not find an available port between 3001-3010');
                        process.exit(1);
                    }
                } else {
                    console.error('❌ Server error:', altErr);
                    process.exit(1);
                }
            });
        };
        
        tryPort();
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});
