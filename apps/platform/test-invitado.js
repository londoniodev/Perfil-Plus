const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://invitado_mcp:invitado123@72.62.161.199:5432/postgres',
    ssl: false,
});

console.log('Testing connection with user: invitado_mcp');

client.connect()
    .then(() => {
        console.log('✅ Connection successful!');
        return client.query('SELECT current_user, current_database()');
    })
    .then(res => {
        console.log('User:', res.rows[0].current_user);
        console.log('Database:', res.rows[0].current_database);
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        client.end();
    });
