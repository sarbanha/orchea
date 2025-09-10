/**
 * Project:   Orchea - Modular Documentation System
 * File:      server.js
 * Author:    Martin A. Sarbanha
 * Version:   1.0
 * Date:      2025-08-30
 *
 * Description:
 *   Express.js server providing REST API for document management, file operations,
 *   and repository management. Handles document creation, editing, and assembly.
 *
 * License: MIT
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Load YAML Parser
const YAMLParser = require('./lib/yaml-parser.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Auto-creation state to prevent multiple simultaneous processes
let isAutoCreating = false;

// Get list of files in repository
app.get('/api/files', async (req, res) => {
    try {
        const repositoryPath = path.join(__dirname, 'repository');
        const files = await fs.readdir(repositoryPath);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        
        // Auto-create missing YAML configs for all markdown files (only once at a time)
        const autoCreate = req.query.autoCreateConfigs === 'true';
        if (autoCreate && !isAutoCreating) {
            isAutoCreating = true;
            console.log('Auto-creating missing YAML configs for all markdown files...');
            
            let createdCount = 0;
            for (const mdFile of markdownFiles) {
                const configFilename = mdFile.replace('.md', '.yaml');
                const configPath = path.join(repositoryPath, configFilename);
                
                try {
                    await fs.access(configPath);
                    // Config exists, skip
                } catch (configError) {
                    // Config doesn't exist, create it
                    console.log(`Creating missing YAML config for ${mdFile}`);
                    
                    const defaultTitle = mdFile.replace('.md', '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
                    const defaultLabel = 'Document';
                    const currentDateTime = new Date().toISOString();
                    
                    const yamlContent = `# File Configuration
title: "${defaultTitle}"
label: "${defaultLabel}"
lastUpdate: "${currentDateTime}"
`;
                    
                    try {
                        await fs.writeFile(configPath, yamlContent, 'utf8');
                        console.log(`YAML config created: ${configFilename}`);
                        createdCount++;
                    } catch (yamlError) {
                        console.error(`Failed to create YAML config for ${mdFile}:`, yamlError);
                    }
                }
            }
            
            if (createdCount > 0) {
                console.log(`Auto-creation complete: ${createdCount} YAML configs created`);
            } else {
                console.log('Auto-creation complete: All YAML configs already exist');
            }
            
            isAutoCreating = false;
        } else if (autoCreate && isAutoCreating) {
            console.log('Auto-creation already in progress, skipping duplicate request');
        }
        
        res.json({ files: markdownFiles });
    } catch (error) {
        console.error('Error reading repository:', error);
        res.status(500).json({ error: 'Failed to read repository' });
    } finally {
        isAutoCreating = false;
    }
});

// Get content of a specific file
app.get('/api/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Security check: allow .md and .yaml files and prevent path traversal
        if ((!filename.endsWith('.md') && !filename.endsWith('.yaml')) || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename - only .md and .yaml files allowed' });
        }

        const filePath = path.join(__dirname, 'repository', filename);
        
        // If requesting a markdown file, ensure its YAML config exists
        if (filename.endsWith('.md')) {
            const configFilename = filename.replace('.md', '.yaml');
            const configPath = path.join(__dirname, 'repository', configFilename);
            
            try {
                await fs.access(configPath);
                console.log(`YAML config exists for ${filename}`);
            } catch (configError) {
                // YAML config doesn't exist, create it
                console.log(`Creating missing YAML config for ${filename}`);
                
                // Generate default title and label from filename
                const defaultTitle = filename.replace('.md', '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
                const defaultLabel = 'Document';
                const currentDateTime = new Date().toISOString();
                
                const yamlContent = `# File Configuration
title: "${defaultTitle}"
label: "${defaultLabel}"
lastUpdate: "${currentDateTime}"
`;
                
                try {
                    await fs.writeFile(configPath, yamlContent, 'utf8');
                    console.log(`YAML config created successfully: ${configFilename}`);
                } catch (yamlError) {
                    console.error(`Failed to create YAML config for ${filename}:`, yamlError);
                    // Continue anyway - don't block reading the markdown file
                }
            }
        }
        
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

        // Security check: allow .md and .yaml files and prevent path traversal
        if ((!filename.endsWith('.md') && !filename.endsWith('.yaml')) || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename - only .md and .yaml files allowed' });
        }

        if (typeof content !== 'string') {
            return res.status(400).json({ error: 'Content must be a string' });
        }

        const filePath = path.join(__dirname, 'repository', filename);
        
        // Create backup of original file (only for .md files to avoid cluttering with .yaml backups)
        if (filename.endsWith('.md')) {
            try {
                const originalContent = await fs.readFile(filePath, 'utf8');
                const backupPath = path.join(__dirname, 'repository', `.${filename}.backup`);
                await fs.writeFile(backupPath, originalContent, 'utf8');
            } catch (backupError) {
                console.log('No existing file to backup or backup failed:', backupError.message);
            }
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

        // Security check: allow .md and .yaml files and prevent path traversal
        if (!filename || (!filename.endsWith('.md') && !filename.endsWith('.yaml')) || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename - only .md and .yaml files allowed' });
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
        
        // If creating a markdown file, automatically create its YAML config
        if (filename.endsWith('.md')) {
            const configFilename = filename.replace('.md', '.yaml');
            const configPath = path.join(__dirname, 'repository', configFilename);
            
            // Check if YAML config already exists
            try {
                await fs.access(configPath);
                console.log(`YAML config already exists for ${filename}`);
            } catch (configError) {
                // Create YAML config
                console.log(`Auto-creating YAML config for new file: ${filename}`);
                
                const defaultTitle = filename.replace('.md', '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
                const defaultLabels = ['Document'];
                const currentDateTime = new Date().toISOString();
                
                const yamlContent = `# File Configuration
title: "${defaultTitle}"
labels: [${defaultLabels.map(label => `"${label}"`).join(', ')}]
lastUpdate: "${currentDateTime}"
`;
                
                try {
                    await fs.writeFile(configPath, yamlContent, 'utf8');
                    console.log(`YAML config created successfully: ${configFilename}`);
                } catch (yamlError) {
                    console.error(`Failed to create YAML config for ${filename}:`, yamlError);
                    // Don't fail the main file creation
                }
            }
        }
        
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

        // Security check: allow .md and .yaml files and prevent path traversal
        if ((!filename.endsWith('.md') && !filename.endsWith('.yaml')) || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename - only .md and .yaml files allowed' });
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

        // Load and process index.html template
        const templatePath = path.join(__dirname, 'templates', 'document-index.html');
        let indexHtmlContent;
        try {
            const template = await fs.readFile(templatePath, 'utf8');
            indexHtmlContent = template.replace('{{DOCUMENT_TITLE}}', title);
        } catch (templateError) {
            console.error('Error loading template:', templateError);
            throw new Error('Failed to load document template');
        }

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

// Get config data for a specific document
app.get('/api/documents/:slug/config', async (req, res) => {
    try {
        const slug = req.params.slug;
        
        // Security check: ensure slug is safe
        if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
            return res.status(400).json({ error: 'Invalid document slug' });
        }
        
        const documentPath = path.join(__dirname, 'documents', slug);
        const configPath = path.join(documentPath, 'config.yaml');
        
        // Check if document directory exists
        try {
            await fs.access(documentPath);
        } catch (error) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        // Read and parse config file
        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            
            // Parse YAML content using YAMLParser
            const parsedConfig = YAMLParser.parse(configContent);
            const config = {
                slug,
                document_title: parsedConfig.document_title || slug,
                title: parsedConfig.document_title || slug, // alias for compatibility
                version: parsedConfig.version || '1.0',
                date: parsedConfig.date || 'Unknown',
                markdown_files: parsedConfig.markdown_files || [],
                path: `documents/${slug}`,
                raw_yaml: configContent
            };
            
            console.log(`Config fetched for document: ${slug}`);
            res.json(config);
            
        } catch (configError) {
            console.error(`Error reading config for ${slug}:`, configError);
            res.status(500).json({ error: 'Failed to read document configuration' });
        }
        
    } catch (error) {
        console.error('Error fetching document config:', error);
        res.status(500).json({ error: 'Failed to fetch document configuration' });
    }
});

// Update an existing document's config
app.put('/api/documents/:slug/update', async (req, res) => {
    try {
        const slug = req.params.slug;
        const { title, version, date, markdown_files } = req.body;

        // Validate required fields
        if (!title || !version || !date || !Array.isArray(markdown_files)) {
            return res.status(400).json({ error: 'Missing required fields: title, version, date, markdown_files' });
        }

        // Security check: ensure slug is safe
        if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
            return res.status(400).json({ error: 'Invalid document slug' });
        }

        const documentPath = path.join(__dirname, 'documents', slug);
        const configPath = path.join(documentPath, 'config.yaml');
        
        // Check if document exists
        try {
            await fs.access(documentPath);
        } catch (error) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Generate updated YAML config content
        const yamlContent = `document_title: "${title}"
version: "${version}"
date: "${date}"
markdown_files:
${markdown_files.map(file => `  - ${file}`).join('\n')}
`;

        // Load and process index.html template with updated title
        const templatePath = path.join(__dirname, 'templates', 'document-index.html');
        let indexHtmlContent;
        try {
            const template = await fs.readFile(templatePath, 'utf8');
            indexHtmlContent = template.replace('{{DOCUMENT_TITLE}}', title);
            console.log(`Template loaded and processed for document: ${slug}`);
        } catch (templateError) {
            console.error('Error loading template:', templateError);
            throw new Error('Failed to load document template');
        }

        // Save the updated config.yaml file
        await fs.writeFile(configPath, yamlContent, 'utf8');

        // Overwrite the index.html file with fresh template content
        const indexPath = path.join(documentPath, 'index.html');
        await fs.writeFile(indexPath, indexHtmlContent, 'utf8');
        console.log(`Index.html overwritten from template for document: ${slug}`);

        console.log(`Document config updated: ${slug}`);
        res.json({
            success: true,
            message: 'Document configuration updated successfully',
            slug,
            path: `documents/${slug}`,
            config_updated: true,
            index_updated: true,
            files_updated: ['config.yaml', 'index.html']
        });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
});

// Delete a document
app.delete('/api/documents/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;

        // Security check: ensure slug is safe
        if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
            return res.status(400).json({ error: 'Invalid document slug' });
        }

        const documentPath = path.join(__dirname, 'documents', slug);
        
        // Check if document exists
        try {
            await fs.access(documentPath);
        } catch (error) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete the entire document directory recursively
        await fs.rm(documentPath, { recursive: true, force: true });

        console.log(`Document deleted: ${slug}`);
        res.json({
            success: true,
            message: 'Document deleted successfully',
            slug,
            deleted_path: `documents/${slug}`
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
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
// Get all tags from YAML configurations
app.get('/api/tags', async (req, res) => {
    try {
        const repositoryPath = path.join(__dirname, 'repository');
        const files = await fs.readdir(repositoryPath);
        const yamlFiles = files.filter(file => file.endsWith('.yaml'));
        
        const tagsMap = new Map();
        const tagStats = {
            total: 0,
            files: 0,
            labels: new Set(),
            usage: new Map()
        };

        for (const yamlFile of yamlFiles) {
            const yamlPath = path.join(repositoryPath, yamlFile);
            
            try {
                const yamlContent = await fs.readFile(yamlPath, 'utf8');
                const config = parseYAML(yamlContent);
                
                // Support both single label (legacy) and labels array (new format)
                const labelsToProcess = [];
                if (config.labels && Array.isArray(config.labels)) {
                    labelsToProcess.push(...config.labels);
                } else if (config.label) {
                    labelsToProcess.push(config.label);
                }
                
                for (const labelItem of labelsToProcess) {
                    if (labelItem) {
                        const label = labelItem.toLowerCase();
                        const displayLabel = labelItem;
                        
                        // Track label usage
                        if (tagsMap.has(label)) {
                            tagsMap.get(label).count++;
                            tagsMap.get(label).files.push(yamlFile.replace('.yaml', '.md'));
                        } else {
                            tagsMap.set(label, {
                                label: displayLabel,
                                count: 1,
                                files: [yamlFile.replace('.yaml', '.md')]
                            });
                        }
                        
                        tagStats.labels.add(displayLabel);
                        tagStats.total++;
                    }
                }
                tagStats.files++;
                
            } catch (fileError) {
                console.warn(`Could not parse YAML file ${yamlFile}:`, fileError.message);
            }
        }
        
        // Convert map to array and sort by usage count
        const tags = Array.from(tagsMap.values()).sort((a, b) => b.count - a.count);
        
        res.json({
            tags,
            stats: {
                totalTags: tagStats.total,
                uniqueLabels: tagStats.labels.size,
                filesProcessed: tagStats.files
            }
        });
        
    } catch (error) {
        console.error('Error analyzing tags:', error);
        res.status(500).json({ error: 'Failed to analyze tags' });
    }
});

// Update YAML configuration for a markdown file
app.put('/api/files/:filename/config', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { title, labels } = req.body;

        // Security check: only allow .md files
        if (!filename.endsWith('.md') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: 'Invalid filename - only .md files allowed' });
        }

        if (!title || !labels) {
            return res.status(400).json({ error: 'Title and labels are required' });
        }

        // Convert comma-delimited string to array if needed
        let labelsArray;
        if (typeof labels === 'string') {
            labelsArray = labels.split(',').map(label => label.trim()).filter(label => label.length > 0);
        } else if (Array.isArray(labels)) {
            labelsArray = labels.filter(label => label && typeof label === 'string' && label.trim().length > 0);
        } else {
            return res.status(400).json({ error: 'Labels must be a string or array' });
        }

        if (labelsArray.length === 0) {
            return res.status(400).json({ error: 'At least one label is required' });
        }

        const configFilename = filename.replace('.md', '.yaml');
        const configPath = path.join(__dirname, 'repository', configFilename);
        const currentDateTime = new Date().toISOString();
        
        const yamlContent = `# File Configuration
title: "${title}"
labels: [${labelsArray.map(label => `"${label}"`).join(', ')}]
lastUpdate: "${currentDateTime}"
`;

        await fs.writeFile(configPath, yamlContent, 'utf8');
        
        console.log(`YAML config updated: ${configFilename}`);
        res.json({ 
            success: true, 
            message: 'Configuration updated successfully',
            filename: configFilename,
            config: {
                title,
                labels: labelsArray,
                lastUpdate: currentDateTime
            }
        });
    } catch (error) {
        console.error('Error updating YAML config:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// Simple YAML parser function for tag analysis
function parseYAML(yamlContent) {
    const config = {};
    if (!yamlContent) return config;
    
    const lines = yamlContent.split('\n');
    
    lines.forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                if (key && value) {
                    // Handle array format: labels: ["tag1", "tag2", "tag3"]
                    if (value.startsWith('[') && value.endsWith(']')) {
                        const arrayContent = value.slice(1, -1).trim();
                        if (arrayContent) {
                            const arrayItems = arrayContent.split(',').map(item => 
                                item.trim().replace(/^["']|["']$/g, '')
                            ).filter(item => item.length > 0);
                            config[key.toLowerCase()] = arrayItems;
                        } else {
                            config[key.toLowerCase()] = [];
                        }
                    } else {
                        // Handle single value
                        config[key.toLowerCase()] = value.replace(/^["']|["']$/g, '');
                    }
                }
            }
        }
    });
    
    return config;
}

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
    console.log(`   GET    /api/files              - List all files`);
    console.log(`   GET    /api/files/:filename    - Get file content`);
    console.log(`   PUT    /api/files/:filename    - Save file content`);
    console.log(`   POST   /api/files              - Create new file`);
    console.log(`   DELETE /api/files/:filename    - Delete file`);
    console.log(`   POST   /api/documents          - Create new document`);
    console.log(`   GET    /api/documents          - List all documents`);
    console.log(`   GET    /api/documents/:slug/config - Get document config`);
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
