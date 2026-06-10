# Clean Jules/Bolt/Sentinel Branches

This lists branches with a small number of changed files compared to main (which makes them easy to merge).

| Branch | Changed Files Count | Author | Commit Subject |
| --- | --- | --- | --- |
| origin/bolt-fix-cancel-order-n1-query-11007004766181430613 | 467 | google-labs-jules[bot] | perf(orders): fix N+1 query when restoring modifier stock on cancellation |
| origin/bolt-fix-n1-order-validation-16701441780155832754 | 439 | google-labs-jules[bot] | ÔÜí Bolt: Fix N+1 query in order validation stock deductions |
| origin/bolt-fix-n1-stock-validation-5848487219653152736 | 287 | google-labs-jules[bot] | perf(orders): use sorted parallel Promise.all for stock deduction |
| origin/bolt-n1-fix-product-variants-1567456888977272874 | 325 | google-labs-jules[bot] | perf(products): parallelize variant creation/update loop |
| origin/bolt-optimize-order-validation-3380377204365476150 | 289 | google-labs-jules[bot] | perf(orders): parallelize stock deductions in validation service |
| origin/bolt-optimize-orders-index-10983243739732201613 | 328 | google-labs-jules[bot] | ÔÜí Bolt: Add explicit tenantId filter to orders queries |
| origin/bolt-optimize-products-service-variants-4553159548567957417 | 392 | google-labs-jules[bot] | perf(api): parallelize variant creation/update in products service |
| origin/bolt-optimize-products-sync-loop-18421630981015730838 | 375 | google-labs-jules[bot] | ÔÜí Bolt: Optimize product variant sync inside transaction |
| origin/bolt-optimize-revalidation-parallelization-14125313022533497116 | 475 | google-labs-jules[bot] | ÔÜí Bolt: Parallelize storefront revalidation requests |
| origin/bolt-optimize-variant-updates-13415506604449247603 | 290 | google-labs-jules[bot] | perf(api): optimize product variant creation loop in update method |
| origin/bolt-optimize-variants-loop-1097020723924154541 | 385 | google-labs-jules[bot] | ÔÜí Bolt: Optimize Product Variants sync N+1 bottleneck |
| origin/bolt-parallelize-variant-sync-8359273620937657690 | 328 | google-labs-jules[bot] | perf(api): parallelize variant creation/update in products sync |
| origin/bolt-perf-variants-update-14797936390607322306 | 313 | google-labs-jules[bot] | ÔÜí Bolt: Refactor variant sync loop for N+1 performance improvement |
| origin/bolt-performance-fix-promise-all-payments-5611263857258260367 | 386 | google-labs-jules[bot] | ÔÜí Bolt: replace sequential N+1 loops with Promise.all in PaymentsService |
| origin/bolt-post-composite-index-13661124313212784245 | 413 | google-labs-jules[bot] | perf(database): add composite index for post queries |
| origin/bolt-whatsapp-processor-optimization-8943926128872622586 | 292 | google-labs-jules[bot] | refactor(api): optimize Next.js ISR fetch loops and WhatsApp processor loops using Promise.allSettled and chunking |
| origin/bolt/explicit-tenant-id-order-queries-15355146969697396202 | 291 | google-labs-jules[bot] | perf(api): explicit tenantId in Order findMany queries |
| origin/bolt/fix-n-plus-1-queries-17586373045219024352 | 376 | google-labs-jules[bot] | ÔÜí Bolt: Fix N+1 queries in Prisma transactions |
| origin/bolt/fix-n1-product-variants-4533732703722593066 | 291 | google-labs-jules[bot] | ÔÜí Bolt: Fix N+1 queries in product variant processing |
| origin/bolt/optimize-io-loops-9564952026527026859 | 315 | google-labs-jules[bot] | perf: parallelize sequential I/O loops in backend services |
| origin/bolt/optimize-loops-performance-8685269453590824853 | 312 | google-labs-jules[bot] | refactor: parallelize I/O bounds and DB updates in loops |
| origin/bolt/optimize-order-cancel-stock-9507032214052611149 | 469 | google-labs-jules[bot] | perf: Optimize N+1 query in order cancellation stock restore |
| origin/bolt/optimize-order-validation-stock-n1-17760017957455115584 | 324 | google-labs-jules[bot] | perf(orders): parallelize stock deductions during order creation |
| origin/bolt/optimize-prisma-loops-11076541984918477661 | 314 | google-labs-jules[bot] | ÔÜí Bolt: Optimize Prisma Create Logic in Loops |
| origin/bolt/optimize-product-variant-loop-9258939324841519016 | 325 | google-labs-jules[bot] | ÔÜí Bolt: Parallelize product variant loop performance |
| origin/bolt/optimize-product-variant-sync-2068837400120169085 | 408 | google-labs-jules[bot] | perf(api): parallelize product variant synchronization queries |
| origin/bolt/optimize-product-variant-updates-4768720196526241975 | 291 | google-labs-jules[bot] | refactor(api): parallelize product variant operations |
| origin/bolt/optimize-stock-deduction-8742778539209856231 | 324 | google-labs-jules[bot] | ÔÜí Bolt: Optimize stock deduction with parallel promises |
| origin/bolt/optimize-stock-deduction-n1-1002622024485020288 | 314 | google-labs-jules[bot] | ÔÜí Bolt: [performance improvement] Parallelize variant stock deductions in order validation |
| origin/bolt/parallelize-cache-revalidation-14028473869873657165 | 467 | google-labs-jules[bot] | ÔÜí Bolt: Parallelize storefront cache revalidation to improve throughput |
| origin/bolt/parallelize-presigned-urls-12349581377256081851 | 313 | google-labs-jules[bot] | perf(api): parallelize presigned url generation for digital items |
| origin/bolt/whatsapp-image-sending-15136439615930490509 | 289 | google-labs-jules[bot] | refactor(whatsapp): optimize image sending with Promise.allSettled and chunking |
| origin/fix-driver-order-status-access-control-12453304439612066093 | 475 | google-labs-jules[bot] | fix(api): implement driver ownership check for order status updates |
| origin/fix-orders-gateway-sse-token-validation-2473365303998017565 | 478 | google-labs-jules[bot] | refactor(api): enforce tenantId presence in SSE token payload |
| origin/fix/add-customer-info-to-order-16122814463024965912 | 288 | google-labs-jules[bot] | ­ƒº╣ Refactor: add customer info support to API payload in create-order |
| origin/fix/enforce-tenant-id-sse-9727869728896781752 | 466 | google-labs-jules[bot] | refactor(api): enforce tenantId in SSE websocket connections |
| origin/fix/sentinel-settings-rls-bypass-1449432143572540939 | 293 | google-labs-jules[bot] | fix: enforce RLS in settings upserts using secure Prisma client |
| origin/jules-8262562998396100263-21cd17c1 | 315 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [Critical] Fix IDOR in Evaluation and Question global models |
| origin/jules-sentinel-fix-idor-lms-models-2649848291335081174 | 315 | google-labs-jules[bot] | fix(security): Fix Cross-Tenant IDOR in LMS evaluations and questions |
| origin/perf-parallel-frontend-revalidation-9734929722460988302 | 488 | google-labs-jules[bot] | perf(tenant): parallelize and unify cache revalidation requests |
| origin/perf/parallel-frontend-revalidation-3312011580213028595 | 467 | google-labs-jules[bot] | perf(api): parallelize frontend revalidation |
| origin/refactor/remove-deprecated-datatable-filter-4489246965840618685 | 288 | google-labs-jules[bot] | refactor(ui): remove deprecated searchKey prop from DataTable |
| origin/sentinel-fix-lms-idor-17654647581547697904 | 395 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [CRITICAL] Fix Cross-Tenant IDOR in LMS module |
| origin/sentinel-fix-lms-idor-7275980847290440100 | 288 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [Critical] Fix Cross-Tenant IDOR |
| origin/sentinel-fix-orders-idor-1536243945393698939 | 323 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: Fix Cross-Tenant IDOR in OrdersService |
| origin/sentinel-fix-products-idor-11815149438950893361 | 326 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [High] Fix Cross-Tenant IDOR in Products Service |
| origin/sentinel-products-idor-7771855409578196326 | 395 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: Fix Cross-Tenant IDOR vulnerability in ProductsService |
| origin/sentinel/fix-blog-idor-14883247515757233106 | 441 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [High] Fix IDOR vulnerabilities in blog module |
| origin/sentinel/fix-idor-evaluation-service-17612338100089536111 | 314 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [Critical] Fix Cross-Tenant IDOR in Evaluation Module |
| origin/sentinel/fix-lms-idor-15116551602924402378 | 332 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: [Critical] Fix Cross-Tenant IDOR in LMS Module |
| origin/sentinel/fix-lms-idor-rls-bypass-3695696417032314893 | 295 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: Fix Cross-Tenant IDOR and RLS Bypass in LMS module |
| origin/sentinel/lms-idor-fix-8122683507357956029 | 325 | google-labs-jules[bot] | ­ƒøí´©Å Sentinel: Fix Cross-Tenant IDOR in LMS Module |
| origin/test/product-transformers-699045092691576348 | 288 | google-labs-jules[bot] | ­ƒº¬ add unit tests for formatProductForTable |
| origin/test/tenant-features-coverage-12671445420465831481 | 288 | google-labs-jules[bot] | test(shared): add edge case tests for getTenantFeatures |

