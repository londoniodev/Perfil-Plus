// Generate a valid JWT for TestSprite testing
const jwt = require('C:\\Users\\Pc\\Desktop\\ALVARO\\REPOSITORIOS\\Web Projects\\node_modules\\.pnpm\\jsonwebtoken@9.0.3\\node_modules\\jsonwebtoken');

const JWT_SECRET = 'super-secret-jwt-key-development-only';

const payload = {
    sub: 'test-admin-user-id-001',
    email: 'admin@testsprite.com',
    role: 'ADMIN',
    name: 'TestSprite Admin'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

console.log('=== JWT TOKEN FOR TESTING ===');
console.log(token);
console.log('=== END TOKEN ===');
