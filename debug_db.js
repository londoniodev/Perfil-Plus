const { Client } = require('pg');

const tryConnect = async (password, encodingType) => {
    const client = new Client({
        user: 'postgres',
        host: '72.62.161.199',
        database: 'postgres',
        password: password,
        port: 5432,
    });

    console.log(`\nProbando conexión con password (${encodingType}): ${password}`);
    try {
        await client.connect();
        console.log("✅ ¡ÉXITO! Conexión establecida correctamente.");
        await client.end();
        return true;
    } catch (err) {
        console.error("❌ Falló:", err.message);
        await client.end();
        return false;
    }
};

(async () => {
    // Intento 1: Password plano (con *)
    await tryConnect('alvarojose1998*', 'Plano');

    // Intento 2: Password URL encoded (con %2A)
    await tryConnect('alvarojose1998%2A', 'URL Encoded');
})();
