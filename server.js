const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serve static files from current directory

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Orchea Documentation System API is running'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🌺 Orchea Documentation System');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📁 Repository path: ${path.join(__dirname, 'repository')}`);
    console.log(`🔧 API endpoints:`);
    console.log(`   GET    /api/files           - List all files`);
    console.log(`   GET    /api/files/:filename - Get file content`);
    console.log(`   PUT    /api/files/:filename - Save file content`);
    console.log(`   POST   /api/files           - Create new file`);
    console.log(`   DELETE /api/files/:filename - Delete file`);
    console.log(`🌐 Open http://localhost:${PORT} to view the application`);
    console.log('🔄 Press Ctrl+C to stop the server');
    console.log('-'.repeat(60));
});
