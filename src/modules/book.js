const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.createBook = async (req, res) => {
    // Render a form or gather input for book details (e.g., title, price, publication date, format type, language type, publisher ID, supplier ID, author)
    // Retrieve the details from the form or request body
    const { title, price, publication_date, format_type, language_type, user_id, sup_id, author } = req.body;
    try {
        const book = {
            book_id: uuidv4(), // Generate a unique ID for the book
            title,
            price,
            publication_date,
            format_type,
            language_type,
            user_id,
            sup_id,
            author // Add the author field to the book object
        };

        await addBook(book); // Call the addBook method to insert the book into the database

        console.log('Book created successfully');
        res.status(200).send('Book created successfully');
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
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

exports.getAllBooks = (req, res) => {
    db.query('SELECT * FROM bookdb.book', (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            console.log('Books:', results);
            res.status(200).json(results);
        }
    });
};

