const http = require('http');

// Create a simple mock server that artificially delays responses to simulate network latency
const server = http.createServer((req, res) => {
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  }, 100); // 100ms artificial delay
});

server.listen(3002, async () => {
  console.log('Mock server listening on port 3002...');

  const tags = ['tag1', 'tag2', 'tag3', 'tag4'];
  const nextjsRevalidationUrl = 'http://localhost:3002';

  // Test sequential requests
  const startSequential = performance.now();
  for (const tag of tags) {
    try {
      await fetch(nextjsRevalidationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag })
      });
    } catch (e) {
      console.error(e);
    }
  }
  const endSequential = performance.now();
  console.log(`Sequential baseline: ${(endSequential - startSequential).toFixed(2)}ms`);

  // Test parallel requests
  const startParallel = performance.now();
  await Promise.all(
    tags.map(async (tag) => {
      try {
        await fetch(nextjsRevalidationUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag })
        });
      } catch (e) {
        console.error(e);
      }
    })
  );
  const endParallel = performance.now();
  console.log(`Parallel optimized: ${(endParallel - startParallel).toFixed(2)}ms`);

  console.log(`Improvement: ${((1 - (endParallel - startParallel) / (endSequential - startSequential)) * 100).toFixed(2)}% faster`);

  server.close();
});
