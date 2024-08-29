const { createServer } = require('node:http');
const { parse } = require('node:url');
const { StringDecoder } = require('node:string_decoder');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.statusCode = 204; // No Content
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.end();
        return;
    }

    // Only handle POST requests to the /register endpoint
    if (parsedUrl.pathname === '/register') {
        let body = '';
        const decoder = new StringDecoder('utf-8');

        // Collect the data chunks
        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        // Once the data collection is finished
        req.on('end', () => {
            body += decoder.end();
            // Here you can process the body as needed
            console.log('Received POST data:', body);

            // Set the response header and status code
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin

            // Respond with a success message and echo the received data
            res.end(JSON.stringify({
                message: 'Registration successful',
                data: body
            }));
        });
    } else {
        // Handle other routes or methods
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
        res.end('You Appear to be lost');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
