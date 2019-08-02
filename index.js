const http = require('http');
const fs = require('fs');
const path = require('path');

const staticPath = 'public';
const host = '127.0.0.1';
const port = 8080;
const server = http.createServer();

server.on('request', (request, response) => {
  let filename;
  if (request.url === '/') {
    filename = path.join(__dirname, staticPath, 'index.html');
  } else {
    filename = path.join(__dirname, staticPath, request.url);
  }

  fs.stat(filename, (error, stats) => {
    if (error) {
      response.writeHead(404, {
        'Content-Type': 'text/html',
      });
      response.end(`error the file is not exise : ${filename}`);
      return;
    }
    const cache = stats.atime.toUTCString();

    let type = 'text/html';
    if (filename.endsWith('.js')) {
      type = 'text/javascript';
    } else {
      type = filename.split('.').pop();
      type = `text/${type}`;
    }

    if (request.headers['if-modified-since'] === cache) {
      response.writeHead(304, 'keep cache', { // 处理游览器缓存
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache',
        'last-modified': cache,
      });
      response.end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'max-age=3600, no-cache',
      'last-modified': cache,
    });
    fs.createReadStream(filename).pipe(response);
  });
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
