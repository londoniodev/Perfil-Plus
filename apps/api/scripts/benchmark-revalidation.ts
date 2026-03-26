
async function sequentialRevalidation(tags: string[], mockFetch: (tag: string) => Promise<void>) {
  const start = Date.now();
  for (const tag of tags) {
    try {
      await mockFetch(tag);
    } catch (e) {
      // Mock log
    }
  }
  return Date.now() - start;
}

async function parallelRevalidation(tags: string[], mockFetch: (tag: string) => Promise<void>) {
  const start = Date.now();
  await Promise.all(
    tags.map(async (tag) => {
      try {
        await mockFetch(tag);
      } catch (e) {
        // Mock log
      }
    })
  );
  return Date.now() - start;
}

async function runBenchmark() {
  const tags = ['tag1', 'tag2', 'tag3', 'tag4'];
  const LATENCY = 100; // 100ms simulated latency per request

  const mockFetch = (tag: string) => new Promise<void>((resolve) => setTimeout(resolve, LATENCY));

  console.log(`Running benchmark with ${tags.length} tags and ${LATENCY}ms latency each...`);

  const sequentialTime = await sequentialRevalidation(tags, mockFetch);
  console.log(`Sequential execution time: ${sequentialTime}ms`);

  const parallelTime = await parallelRevalidation(tags, mockFetch);
  console.log(`Parallel execution time: ${parallelTime}ms`);

  const improvement = ((sequentialTime - parallelTime) / sequentialTime) * 100;
  console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmark().catch(console.error);
