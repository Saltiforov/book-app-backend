const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Add a new order item
exports.addOrderItem = async (req, res) => {
    const { first_name, last_name, email, phone, delivery_city, delivery_res, comment, books } = req.body;
    const order_id = uuidv4();

    try {
        // Retrieve the book details using the book IDs
        const bookDetails = await getBookDetails(books);

        const orderItem = {
            order_id,
            first_name,
            last_name,
            email,
            phone,
            delivery_city,
            delivery_res,
            comment,
            books: bookDetails
        };

        db.query(
            'INSERT INTO bookdb.order_item (order_id, first_name, last_name, email, phone, delivery_city, delivery_res, comment, books) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [orderItem.order_id, orderItem.first_name, orderItem.last_name, orderItem.email, orderItem.phone, orderItem.delivery_city, orderItem.delivery_res, orderItem.comment, JSON.stringify(orderItem.books)],
            (error, results) => {
                if (error) {
                    console.log('Error:', error);
                    res.status(500).send('Internal server error');
                } else {
                    console.log('Order item added successfully');
                    res.status(200).send('Order item added successfully');
                }
            }
        );
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
};

// Retrieve the book details using the book IDs
const getBookDetails = async (bookIds) => {
    const books = [];
    for (const bookId of bookIds) {
        try {
            const book = await getBookById(bookId);
            books.push(book);
        } catch (error) {
            console.log('Error:', error);
        }
    }
    return books;
};

// Retrieve a single book by ID
const getBookById = (bookId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM bookdb.book WHERE book_id = ?',
            [bookId],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length === 0) {
                        reject('Book not found');
                    } else {
                        const book = results[0];
                        resolve(book);
                    }
                }
            }
        );
    });
};

// Get all order items
exports.getAllOrderItems = (req, res) => {
    db.query('SELECT * FROM order_item', (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            console.log('Order items:', results);
            res.status(200).json(results);
        }
    });
};