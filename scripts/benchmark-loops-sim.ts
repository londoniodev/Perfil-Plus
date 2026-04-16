async function runSim() {
  const mockTx = {
    update: async (data: any) => {
      await new Promise(r => setTimeout(r, 2)); // simulate IPC/DB latency
    }
  };

  const variants = Array.from({ length: 50 }).map((_, i) => ({ id: `id-${i}` }));

  const startSeq = performance.now();
  for (const v of variants) {
    await mockTx.update({ where: { id: v.id } });
  }
  const endSeq = performance.now();

  const startPar = performance.now();
  const promises = variants
    .map((v, i) => ({ v, originalIndex: i }))
    .sort((a, b) => a.v.id.localeCompare(b.v.id))
    .map(({ v }) => mockTx.update({ where: { id: v.id } }));
  await Promise.all(promises);
  const endPar = performance.now();

  console.log(`Sequential: ${(endSeq - startSeq).toFixed(2)} ms`);
  console.log(`Parallel: ${(endPar - startPar).toFixed(2)} ms`);
  console.log(`Improvement: ${(((endSeq - startSeq) - (endPar - startPar)) / (endSeq - startSeq) * 100).toFixed(2)}%`);
}

runSim();
