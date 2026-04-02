const fs = require('fs');
let code = fs.readFileSync('apps/api/src/modules/products/products.service.spec.ts', 'utf8');

// Ensure findFirst is mocked for product
code = code.replace(/findUnique: jest.fn\(\),/g, 'findUnique: jest.fn(),\n      findFirst: jest.fn(),');

// Ensure tests use findFirst instead of findUnique to match implementation
code = code.replace(/\.findUnique/g, '.findFirst');

fs.writeFileSync('apps/api/src/modules/products/products.service.spec.ts', code);
