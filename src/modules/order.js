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
const delivery_cities1 = [
    { name: 'Київ', code: 'Kyiv' },
    { name: 'Харків', code: 'Kharkiv' },
    { name: 'Одеса', code: 'Odesa' },
    { name: 'Суми', code: 'Sumy' },
    { name: 'Кременчук', code: 'Kremenchuk' },
    { name: 'Ужгород', code: 'Uzhhorod' },
    { name: 'Бровари', code: 'Breweries' },
    { name: 'Рівне', code: 'Rivne' },
]
const delivery_res1 = [
    { name: 'Відділення №1', code: 'number1' },
    { name: 'Відділення №2', code: 'number2' },
    { name: 'Відділення №3', code: 'number3' },
    { name: 'Відділення №4', code: 'number4' },
    { name: 'Відділення №5', code: 'number5' },
    { name: 'Відділення №6', code: 'number6' },
    { name: 'Відділення №7', code: 'number7' },
    { name: 'Відділення №8', code: 'number8' },
]

exports.editOrderItem = async (req, res) => {
    const { order_id, first_name, last_name, email, phone, delivery_city, delivery_res, comment, user_id } = req.body;

    try {
        // Retrieve the existing order item from the database
        const existingOrderItem = await getOrderItem(order_id);

        // Check if the order item exists
        if (!existingOrderItem) {
            res.status(404).send('Order item not found');
            return;
        }
        const delivery_city1 = delivery_city.code
        const delivery_res1 = delivery_res.code
        // Use the existing books array from the database
        const existingBooks = existingOrderItem.books;

        const updatedOrderItem = {
            order_id,
            first_name,
            last_name,
            email,
            phone,
            delivery_city: delivery_city1,
            delivery_res: delivery_res1,
            comment,
            books: existingBooks, // Use the existing books array
            user_id
        };

        // Update the order item in the database
        await updateOrderItem(order_id, updatedOrderItem);

        // Retrieve the updated order item from the database
        const updatedItem = await getOrderItem(order_id);

        console.log('Order item updated successfully');
        res.status(200).json(updatedItem); // Send the updated order item in the response
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
};

function getOrderItem(orderId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM bookdb.order_item WHERE order_id = ?', [orderId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                if (results.length === 0) {
                    resolve(null); // Order item not found
                } else {
                    const orderItem = results[0];
                    orderItem.books = JSON.parse(orderItem.books); // Parse JSON string back into an array
                    resolve(orderItem);
                }
            }
        });
    });
}

function updateOrderItem(orderId, updatedOrderItem) {
    return new Promise((resolve, reject) => {
        db.query(
            'UPDATE bookdb.order_item SET first_name = ?, last_name = ?, email = ?, phone = ?, delivery_city = ?, delivery_res = ?, comment = ?, books = ?, user_id = ? WHERE order_id = ?',
            [
                updatedOrderItem.first_name,
                updatedOrderItem.last_name,
                updatedOrderItem.email,
                updatedOrderItem.phone,
                updatedOrderItem.delivery_city,
                updatedOrderItem.delivery_res,
                updatedOrderItem.comment,
                JSON.stringify(updatedOrderItem.books),
                updatedOrderItem.user_id,
                orderId
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
}



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

            res.status(200).json(parsedResults);
        }
    });
};
exports.deleteOrderItem = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Check if the order item exists
        const existingOrderItem = await getOrderItem(orderId);
        if (!existingOrderItem) {
            res.status(404).send('Order item not found');
            return;
        }

        // Delete the order item from the database
        await deleteOrderItemById(orderId);

        console.log('Order item deleted successfully');
        res.status(200).send('Order item deleted successfully');
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
}

function deleteOrderItemById(orderItemId) {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM bookdb.order_item WHERE order_id = ?', [orderItemId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}