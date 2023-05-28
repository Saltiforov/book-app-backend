const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const secretKey = 'your-secret-key-here';
const { v4: uuidv4 } = require('uuid');

exports.createNewUser = async (req, res) => {
    const { password, user_name, first_name, last_name, email, phone, address } = req.body;
    const user_id = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO bookdb.user (user_id, user_name, first_name, last_name, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, user_name, first_name, last_name, phone, email, address],
        (error, results) => {
            if (error) {
                console.log('error', error);
                res.status(500).send('Internal server error');
            } else {
                console.log('result', results);
                res.status(200).send('User created successfully');
            }
        }
    );
};


exports.login = async (req, res) => {
    const { user_name, password } = req.body;
    db.query('SELECT * FROM bookdb.user WHERE user_name = ?', [user_name], async (error, results) => {
        if (error) {
            console.log('error', error)
            res.status(500).send('Internal server error');
        } else if (results.length === 0) {
            res.status(401).send('Invalid user name or password');
        } else {
            const passwordMatch = await bcrypt.compare(password, results[0].password);
            if (passwordMatch) {
                const user = results[0]; // отримати інформацію про користувача з результатів запиту
                delete user.password;
                console.log('user', user)
                const accessToken = jwt.sign({ user_name: user_name, role: 'user', user: user }, secretKey, { expiresIn: '1h' }); // включити інформацію про користувача в поле токена
                res.status(200).json({ accessToken: accessToken, user: user }); // повернути інформацію про користувача разом з токеном
            } else {
                res.status(401).send('Invalid user name or password');
            }
        }
    });
};
