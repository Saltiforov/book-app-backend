const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.createNewPart = async (req, res) => {
    const { part_name, part_count, price, description } = req.body;
    const part_id = uuidv4(); // Генеруємо новий UUID

    const query = 'INSERT INTO mydb.parts (part_id, part_name, part_count, price, description) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [part_id, part_name, part_count, price, description], (error, results) => {
        if (error) {
            console.log('error', error);
            res.status(500).send('Internal server error');
        } else {
            res.status(200).json({ message: 'Part created successfully.', part_id });
        }
    });
}

exports.getPartsList = async (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM mydb.parts WHERE 1=1';
    const values = [];

    if (search) {
        query += ' AND part_name LIKE ?';
        values.push(`%${search}%`);
    }

    db.query(query, values, (error, results) => {
        if (error) {
            console.log('error', error);
            res.status(500).send('Internal server error');
        } else {
            res.status(200).json([...results]);
        }
    });
}

exports.getPartsListForSelection = async (req, res) => {
    const query = 'SELECT part_id, part_name FROM mydb.parts';
    db.query(query, (error, results) => {
        if (error) {
            console.log('error', error);
            res.status(500).send('Internal server error');
        } else {
            const parts = Array.isArray(results) ? results.map((part) => ({
                id: part.part_id,
                part_name: part.part_name
            })) : [];

            res.status(200).json([...parts]);
        }
    });
}