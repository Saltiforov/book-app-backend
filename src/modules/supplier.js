const db = require('../db');


// Get all suppliers
exports.getAllSuppliers = (req, res) => {
    db.query('SELECT * FROM bookdb.supplier', (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            console.log('Suppliers:', results);
            res.status(200).json(results);
        }
    });
};
