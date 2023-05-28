const mysql = require('mysql');
const config = require('../config');

const index = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
});

index.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database!');
});

module.exports = index;
