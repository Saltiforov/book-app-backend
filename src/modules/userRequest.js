const db = require('../db');
let request_id = 1;

exports.createUserRequest = async (req, res) => {
    const { user_name, email, summary } = req.body;

    const getMaxRequestIdQuery = 'SELECT MAX(request_id) AS max_request_id FROM mydb.user_request';
    db.query(getMaxRequestIdQuery, (error, results) => {
        if (error) {
            console.log('error', error);
            res.status(500).send('Internal server error');
        } else {
            const maxRequestId = results[0].max_request_id || 0;
            const request_id = +maxRequestId + 1;

            const insertQuery = 'INSERT INTO mydb.user_request (request_id, user_name, email, summary) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [request_id, user_name, email, summary], (error, results) => {
                if (error) {
                    console.log('error', error);
                    res.status(500).send('Internal server error');
                } else {
                    res.status(200).json({ message: 'User request created successfully.' });
                }
            });
        }
    });
};

exports.getUserRequests = async (req, res) => {
    const query = 'SELECT * FROM mydb.user_request';
    db.query(query, (error, results) => {
        if (error) {
            console.log('error', error)
            res.status(500).send('Internal server error');
        } else {
            res.status(200).json({ data: results });
        }
    });
}


exports.getUserListForSelection = async (req, res) => {
    const { search } = req.query;

    let query = 'SELECT request_id, user_name, email, summary FROM mydb.user_request';
    let values = [];

    if (search) {
        query += ' WHERE user_name LIKE ? OR email LIKE ? OR summary LIKE ?';
        values = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    db.query(query, values, (error, results) => {
        if (error) {
            console.log('error', error);
            res.status(500).send('Internal server error');
        } else {
            const requests = Array.isArray(results)
                ? results.map((request) => ({
                    id: request.request_id,
                    user: request.user_name,
                    email: request.email,
                    summary: request.summary,
                }))
                : [];

            res.status(200).json([...requests]);
        }
    });
};