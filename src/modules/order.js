const db = require('../db');
const { v4: uuidv4 } = require('uuid');

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

// Edit an order item
exports.editOrderItem = async (req, res) => {
    const { order_id, first_name, last_name, email, phone, delivery_city, delivery_res, comment, books, user_id } = req.body;

    try {
        // Retrieve the book details using the book IDs
        const bookDetails = await getBookDetails(books);

        const updatedOrderItem = {
            order_id,
            first_name,
            last_name,
            email,
            phone,
            delivery_city,
            delivery_res,
            comment,
            books: bookDetails,
            user_id
        };

        db.query(
            'UPDATE bookdb.order_item SET first_name = ?, last_name = ?, email = ?, phone = ?, delivery_city = ?, delivery_res = ?, comment = ?, books = ?, user_id = ? WHERE order_id = ?',
            [updatedOrderItem.first_name, updatedOrderItem.last_name, updatedOrderItem.email, updatedOrderItem.phone, updatedOrderItem.delivery_city, updatedOrderItem.delivery_res, updatedOrderItem.comment, JSON.stringify(updatedOrderItem.books), updatedOrderItem.user_id, updatedOrderItem.order_id],
            (error, results) => {
                if (error) {
                    console.log('Error:', error);
                    res.status(500).send('Internal server error');
                } else {
                    console.log('Order item updated successfully');
                    res.status(200).send('Order item updated successfully');
                }
            }
        );
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
};


// Search books by name or ID
const searchBooks = (searchQuery) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM bookdb.book WHERE title = ? OR book_id = ?',
            [searchQuery, searchQuery],
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

// Get all order items with search functionality
exports.getAllOrderItems = (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM bookdb.order_item';

    if (search) {
        // Modify the query to include the search criteria
        query += ` WHERE first_name LIKE '%${search}%' OR last_name LIKE '%${search}%'`;
    }

    db.query(query, (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            const parsedResults = results.map((item) => {
                return {
                    ...item,
                    books: JSON.parse(item.books)
                };
            });

            console.log('Parsed order items:', parsedResults);
            res.status(200).json(parsedResults);
        }
    });
};