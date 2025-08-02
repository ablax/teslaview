const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get file information (for future use)
app.get('/api/files', (req, res) => {
    const directory = req.query.directory;
    if (!directory) {
        return res.status(400).json({ error: 'Directory parameter is required' });
    }

    try {
        const files = fs.readdirSync(directory);
        const videoFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp4', '.mov', '.avi', '.mkv'].includes(ext);
        });

        res.json({ files: videoFiles });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read directory' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TeslaCam Player is running' });
});

app.listen(PORT, () => {
    console.log(`TeslaCam Video Player server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
}); 