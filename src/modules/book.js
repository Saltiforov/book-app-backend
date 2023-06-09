const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.createBook = async (req, res) => {
    const { title, price, publication_date, format_type, language_type, user_id, sup_id, author } = req.body;

    try {
        const languageTypeObj = JSON.parse(language_type);
        const book = {
            book_id: uuidv4(),
            title,
            price,
            publication_date,
            format_type,
            language_type: languageTypeObj.code,
            user_id,
            sup_id,
            author,
            available: true,
            image: req.file.buffer
        };

        await addBook(book);

        res.status(200).send('Book created successfully');
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
};

exports.editBook = async (req, res) => {
    const { bookId } = req.params;
    const { title, price, publication_date, format_type, language_type, user_id, sup_id, author, available } = req.body;
    try {
        const existingBook = await getBookById(bookId);
        if (!existingBook) {
            res.status(404).send('Book not found');
            return;
        }

        const isSupplierExists = await checkSupplierExists(sup_id);
        if (!isSupplierExists) {
            res.status(400).send('Invalid supplier ID');
            return;
        }

        const updatedBook = {
            ...existingBook,
            title: title || existingBook.title,
            price: price || existingBook.price,
            publication_date: publication_date || existingBook.publication_date,
            format_type: format_type || existingBook.format_type,
            language_type: language_type ? language_type : existingBook.language_type,
            user_id: user_id || existingBook.user_id,
            sup_id: sup_id || existingBook.sup_id,
            author: author || existingBook.author,
            available: available || false
        };

        await updateBook(bookId, updatedBook);

        const updatedItem = await getBookById(bookId);

        res.status(200).json(updatedItem);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
};

const getBookById = async (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM bookdb.book WHERE book_id = ?';

        db.query(query, [id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                // Extract the first (and only) book item from the results
                const book = results[0];
                resolve(book);
            }
        });
    });
};

const updateBook = async (id, updatedBook) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE bookdb.book SET title = ?, price = ?, publication_date = ?, format_type = ?, language_type = ?, user_id = ?, sup_id = ?, author = ?, available = ? WHERE book_id = ?';
        const values = [
            updatedBook.title,
            updatedBook.price,
            updatedBook.publication_date,
            updatedBook.format_type,
            updatedBook.language_type,
            updatedBook.user_id,
            updatedBook.sup_id,
            updatedBook.author,
            updatedBook.available,
            id
        ];

        db.query(query, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
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

exports.deleteBook = async (req, res) => {
    const bookId = req.params.bookId;

    db.query('DELETE FROM bookdb.book WHERE book_id = ?', [bookId], (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            console.log('Book deleted successfully');
            res.status(200).send('Book deleted successfully');
        }
    });
}

exports.getAllBooks = (req, res) => {
    const { language_type, format_type, searchQuery, min_price, max_price, available } = req.query;

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
        query += ' AND (title LIKE ? OR book_id = ?)';
        queryParams.push(`%${searchQuery}%`);
        queryParams.push(searchQuery);
    }

    if (min_price && max_price) {
        query += ' AND price >= ? AND price <= ?';
        queryParams.push(min_price);
        queryParams.push(max_price);
    }

    if (available === 'true') {
        query += ' AND available = 1';
    } else if (available === 'false') {
        query += ' AND available = 0';
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            // Map the results and check if the image exists
            const booksWithImage = results.map((book) => {
                const bookWithImage = { ...book };
                if (book.image) {
                    // Assuming the image is stored as a Blob type
                    const imageBuffer = Buffer.from(book.image, 'base64');
                    bookWithImage.image = imageBuffer.toString('base64');
                }
                return bookWithImage;
            });

            console.log('Books:', booksWithImage);
            res.status(200).json(booksWithImage);
        }
    });
};


// Add a book to the database
const addBook = (book) => {
    return new Promise((resolve, reject) => {
        // Convert the image data to a Buffer
        const imageBuffer = Buffer.from(book.image, 'base64');

        db.query(
            'INSERT INTO bookdb.book (book_id, title, price, publication_date, format_type, language_type, user_id, sup_id, author, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                book.book_id,
                book.title,
                book.price,
                book.publication_date,
                book.format_type,
                book.language_type,
                book.user_id,
                book.sup_id,
                book.author,
                imageBuffer // Store the image as a Buffer
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
