const db = require('../db');

// Get all users
exports.getAllUsers = (req, res) => {
    db.query('SELECT user_name, user_id FROM  bookdb.user', (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            const users = results.map((result) => {
                return {
                    user_name: result.user_name,
                    user_id: result.user_id
                };
            });
            console.log('Users:', users);
            res.status(200).json(users);
        }
    });
};