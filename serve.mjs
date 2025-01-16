// USE ONLY FOR DEVELOPMENT
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'http://127.0.0.1:3001',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, 'public_html');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};


// Function to serve static files
async function serveStaticFile(filePath, res) {
    try {
        const ext = path.extname(filePath);
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        const fileContent = await fs.readFile(filePath);
        res.statusCode = 200;
        res.setHeader('Content-Type', mimeType);
        res.end(fileContent);
    } catch (error) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404: File Not Found');
    }
}

// Current value state
let current_value = 50;
let current_button_state = 0;
// Function to serve /api/v1 endpoints
function handleApiRequest(req, res) {
    if (req.url.startsWith('/api/v1/status')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const incoming_value = url.searchParams.get('value');
        if (incoming_value !== null) {
            current_value = incoming_value; 
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(`Received value: ${current_value}`);
        } else {
            res.writeHead(400, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            });
            res.end("400 - Bad Request: 'value' parameter is missing");
        }
    // get current tem/humi, respond is the current_value
    } else if (req.url === '/api/v1/current') {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(`Current value: ${current_value}`);
        // button endpoint
    } else if (req.url.startsWith('/api/v1/button')){
        const url = new URL(req.url, `http://${req.headers.host}`);
        const incoming_buttonState = url.searchParams.get('value'); // Get the 'value' parameter from the query string
        if (incoming_buttonState !== null) {
            current_button_state = incoming_buttonState;
            console.log(`Button state received: ${incoming_buttonState}`);
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(`Button state set to: ${incoming_buttonState}`);
        } else {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
        });
        res.end("404 - Not Found");
    }
    // get button state, respond is the current_button_state
    } else if (req.url === '/api/v1/btncurrent'){ 
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(`Current value: ${current_button_state}`);
    }
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/api/v1')) {
        // Handle API requests under /api/v1
        handleApiRequest(req, res);
    } else {
        // Serve static files for non-API requests
        let requestedPath = req.url === '/' ? '/index.html' : req.url;
        const filePath = path.join(PUBLIC_DIR, requestedPath);
        await serveStaticFile(filePath, res);
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
