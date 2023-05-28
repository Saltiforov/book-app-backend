const db = require('../db');

exports.getUsers = async (req, res) => {
    const query = 'SELECT worker_code, user_name AS name FROM mydb.worker';
    db.query(query, (error, results) => {
        if (error) {
            console.log('error', error);
            res.status(500).send('Internal server error');
        } else {
            const workers = Array.isArray(results)
                ? results.map((worker) => ({
                    id: worker.worker_code,
                    name: worker.name,
                }))
                : [];

            res.status(200).json([...workers]);
        }
    });
};