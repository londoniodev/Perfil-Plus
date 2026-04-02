const fs = require('fs');

let content = fs.readFileSync('apps/api/src/modules/products/products.service.spec.ts', 'utf8');

content = content.replace(/findUnique: jest\.fn\(\)/g, "findUnique: jest.fn(),\n      findFirst: jest.fn()");

fs.writeFileSync('apps/api/src/modules/products/products.service.spec.ts', content);
