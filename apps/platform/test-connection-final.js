const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:alvarojose1998*@72.62.161.199:5432/postgres',
    ssl: false,
});

console.log('Testing connection with password: alvarojose1998*');

client.connect()
    .then(() => {
        console.log('✅ Connected successfully!');
        return client.query('SELECT current_database(), current_user, version()');
    })
    .then(res => {
        console.log('Database:', res.rows[0].current_database);
        console.log('User:', res.rows[0].current_user);
        console.log('Version:', res.rows[0].version);
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        client.end();
    });
