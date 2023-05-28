const db = require('../db');

// Create a new book
exports.createBook = async (req, res) => {
    // Render a form or gather input for book details (e.g., title, price, publication date, format type, language type, publisher ID, supplier ID)
    // Retrieve the details from the form or request body
    const { title, price, publication_date, format_type, language_type, publisher_id, sup_id } = req.body;

    try {
        const book = {
            book_id: uuidv4(), // Generate a unique ID for the book
            title,
            price,
            publication_date,
            format_type,
            language_type,
            publisher_id,
            sup_id
        };

        await addBook(book); // Call the addBook method to insert the book into the database

        res.status(200).send('Book created successfully');
    } catch (error) {
        console.log('error', error);
        res.status(500).send('Internal server error');
    }
};

// Add a book to the database
const addBook = (book) => {
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO bookdb.book (book_id, title, price, publication_date, format_type, language_type, publisher_id, sup_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                book.book_id,
                book.title,
                book.price,
                book.publication_date,
                book.format_type,
                book.language_type,
                book.publisher_id,
                book.sup_id
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
};
