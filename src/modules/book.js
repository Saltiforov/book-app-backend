const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.createBook = async (req, res) => {
    const { title, price, publication_date, format_type, language_type, user_id, sup_id, author } = req.body;
    try {
        // Check if the supplier exists
        const isSupplierExists = await checkSupplierExists(sup_id);
        if (!isSupplierExists) {
            res.status(400).send('Invalid supplier ID');
            return;
        }

        const book = {
            book_id: uuidv4(),
            title,
            price,
            publication_date,
            format_type,
            language_type: language_type.code,
            user_id,
            sup_id,
            author
        };

        await addBook(book);

        console.log('Book created successfully');
        res.status(200).send('Book created successfully');
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
};


// Check if the supplier exists
const checkSupplierExists = (sup_id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT sup_id FROM bookdb.supplier WHERE sup_id = ?', [sup_id], (error, results) => {
            if (error) {
                console.log('Error:', error);
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
};
// Define an array of languages with IDs and names
const languages = [
    { id: 1, name: 'Українська', code: 'ua' },
    { id: 2, name: 'Німецька', code: 'dc' },
    { id: 3, name: 'Іспанська', code: 'sp' },
    { id: 4, name: 'Англійська', code: 'en' },
    { id: 5, name: 'Французька', code: 'fr' }
];

// Endpoint to retrieve the languages
exports.getLanguages = (req, res) => {
    res.status(200).json(languages);
};


exports.getAllBooks = (req, res) => {
    const { language_type, format_type, searchQuery, min_price, max_price } = req.query;

    let query = 'SELECT * FROM bookdb.book WHERE 1 = 1';
    const queryParams = [];

    if (language_type) {
        query += ' AND language_type = ?';
        queryParams.push(language_type);
    }

    if (format_type) {
        query += ' AND format_type = ?';
        queryParams.push(format_type);
    }

    if (searchQuery) {
        query += ' AND (name LIKE ? OR id = ?)';
        queryParams.push(`%${searchQuery}%`);
        queryParams.push(searchQuery);
    }

    if (min_price && max_price) {
        query += ' AND price >= ? AND price <= ?';
        queryParams.push(min_price);
        queryParams.push(max_price);
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            console.log('Books:', results);
            res.status(200).json(results);
        }
    });
};


// Add a book to the database
const addBook = (book) => {
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO bookdb.book (book_id, title, price, publication_date, format_type, language_type, user_id, sup_id, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                book.book_id,
                book.title,
                book.price,
                book.publication_date,
                book.format_type,
                book.language_type,
                book.user_id,
                book.sup_id,
                book.author
            ],
            (error, results) => {
                if (error) {
                    console.log('Error:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
};
