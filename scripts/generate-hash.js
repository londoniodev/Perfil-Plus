const bcrypt = require('bcryptjs');

async function main() {
    const hash = await bcrypt.hash('123456', 12);
    console.log(`NEW_HASH=${hash}`);
}

main();
