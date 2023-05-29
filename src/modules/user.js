const db = require('../db');

// Get all users
exports.getAllUsers = (req, res) => {
    db.query('SELECT user_name, id FROM users', (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            const users = results.map((result) => {
                return {
                    user_name: result.user_name,
                    id: result.id
                };
            });
            console.log('Users:', users);
            res.status(200).json(users);
        }
    });
};