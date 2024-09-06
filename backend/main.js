const { createServer } = require('node:http');
const { parse } = require('node:url');
const { StringDecoder } = require('node:string_decoder');
const { exec } = require('child_process');

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
            console.log(req)
            // Execute the shell script and capture its output
            exec('sh test-script.sh ' + body, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
                    res.end(JSON.stringify({ error: error.message }));
                    return;
                }

                if (stderr) {
                    console.error(`Script stderr: ${stderr}`);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
                    res.end(JSON.stringify({ error: stderr }));
                    return;
                }

                console.log(`Script output: ${stdout}`);

                // Set the response header and status code
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin

                // Respond with the script output
                res.end(JSON.stringify({
                    message: 'Script executed successfully',
                    output: stdout
                }));
            });
        });
    } else if (parsedUrl.pathname === '/verify') {

        let body = '';
        const decoder = new StringDecoder('utf-8');
        // Listen for data chunks
        req.on('data', chunk => {
            body += decoder.write(chunk);
        });

        // When the request ends, check the body
        req.on('end', () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
            //sample output hash implement with DB
            console.log(body)
            if (body == "dc76fcc3c1f6b10c8954522188596bc33697590beb81f88733e6235dea1124db") {
                res.end(JSON.stringify({
                    message: 'File Exists',
                    output: "File Exists at time 10000"
                }));
            } else {
                res.end(JSON.stringify({
                    message: 'File Does Not Exist',
                    output: "File Does Not Exist"
                }));
            }
        });
    }
    else {
        // Handle other routes or methods
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
        res.end('You appear to be lost');
    }
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
