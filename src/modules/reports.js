const db = require('../db');

// Generate random total price data for each month
function generateRandomTotalPriceData() {
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Now', 'Dec', 'Jan'];
    const totalPriceData = [];

    for (let i = 0; i < months.length; i++) {
        const randomPrice = Math.floor(Math.random() * 100000) + 1; // Generate a random price between 1 and 100000
        totalPriceData.push({ month: months[i], totalPrice: randomPrice });
    }

    return totalPriceData;
}

// Get actual total price data for the month of June from the order_item table
function getActualTotalPriceData() {
    return new Promise((resolve, reject) => {
        db.query('SELECT books FROM bookdb.order_item', (error, results) => {
            if (error) {
                reject(error);
            } else {
                let totalPrice = 0;
                results.forEach((item) => {
                    const books = JSON.parse(item.books);
                    console.log('books DB', books)
                    books.forEach((book) => {
                        totalPrice += book.price;
                    });
                });
                resolve(totalPrice);
            }
        });
    });
}

exports.getSalesReports = async (req, res) => {
    try {
        const randomTotalPriceData = generateRandomTotalPriceData();
        const actualTotalPrice = await getActualTotalPriceData();
        const updatedTotalPriceData = randomTotalPriceData.map((data) => {
            if (data.month === 'Jun') {
                return { month: data.month, totalPrice: actualTotalPrice };
            }
            return data;
        });

        console.log('Sales Report Data:', updatedTotalPriceData);
        res.status(200).json(updatedTotalPriceData);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).send('Internal server error');
    }
}

exports.getBooksPerSupplierReport = (req, res) => {
    const query = 'SELECT book.sup_id, supplier.supplier_name, COUNT(*) AS book_count FROM bookdb.book JOIN bookdb.supplier ON book.sup_id = supplier.sup_id GROUP BY book.sup_id';

    db.query(query, (error, results) => {
        if (error) {
            console.log('Error:', error);
            res.status(500).send('Internal server error');
        } else {
            const reportData = results.map((item) => {
                return {
                    supplierId: item.sup_id,
                    bookCount: item.book_count
                };
            });

            // Fetch supplier name for each supplier ID
            const supplierIds = reportData.map((item) => item.supplierId);
            const supplierQuery = 'SELECT sup_id, supplier_name FROM bookdb.supplier WHERE sup_id IN (?)';
            db.query(supplierQuery, [supplierIds], (supplierError, supplierResults) => {
                if (supplierError) {
                    console.log('Error:', supplierError);
                    res.status(500).send('Internal server error');
                } else {
                    const supplierMap = new Map();
                    supplierResults.forEach((supplier) => {
                        supplierMap.set(supplier.sup_id, supplier.supplier_name);
                    });

                    // Add supplier name to the report data
                    reportData.forEach((item) => {
                        item.supplierName = supplierMap.get(item.supplierId);
                    });

                    console.log('Books per supplier report:', reportData);
                    res.status(200).json(reportData);
                }
            });
        }
    });
};