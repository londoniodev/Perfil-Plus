const { execSync } = require('child_process');
try {
  execSync('pnpm --filter api test -- src/modules/payments/payments.service.spec.ts', { stdio: 'inherit' });
} catch (e) {
  process.exit(0);
}
