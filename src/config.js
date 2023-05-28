require('dotenv').config();

module.exports = {
    host: 'localhost',
    user: 'root',
    password: '',
    serverPort: process.env.SERVER_PORT || 8000,
};
