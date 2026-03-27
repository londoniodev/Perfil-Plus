const http = require('http');

const server = http.createServer((req, res) => {
  setTimeout(() => {
    res.writeHead(200);
    res.end('OK');
  }, 100); // 100ms latency
});

server.listen(3000, async () => {
  const url = 'http://localhost:3000';
  const tags = ['tag1', 'tag2', 'tag3', 'tag4'];

  const serialRevalidation = async (tags) => {
    for (const tag of tags) {
      await fetch(url, { method: 'POST', body: JSON.stringify({ tag }) });
    }
  };

  const parallelRevalidation = async (tags) => {
    await Promise.all(
      tags.map(tag => fetch(url, { method: 'POST', body: JSON.stringify({ tag }) }))
    );
  };

  console.log('--- Benchmarking Serial ---');
  let start = performance.now();
  await serialRevalidation(tags);
  let end = performance.now();
  const serialTime = end - start;
  console.log(`Serial time: ${serialTime.toFixed(2)} ms`);

  console.log('--- Benchmarking Parallel ---');
  start = performance.now();
  await parallelRevalidation(tags);
  end = performance.now();
  const parallelTime = end - start;
  console.log(`Parallel time: ${parallelTime.toFixed(2)} ms`);

  console.log(`Improvement: ${((serialTime - parallelTime) / serialTime * 100).toFixed(2)}%`);

  server.close();
});
