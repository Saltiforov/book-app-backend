const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();
app.use(bodyParser.json());
console.log('config', config);
app.listen(config.serverPort, () => {
    console.log(`Server started on port ${config.serverPort}`);
});
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage});
const authModule = require('./modules/auth');
const BookModule = require('./modules/book');
const OrderModule = require('./modules/order');
const SupplierModule = require('./modules/supplier');
const UserModule = require('./modules/user');
const ReportsModule = require('./modules/reports');

app.post('/api/login', authModule.login);

app.post('/api/signup', authModule.createNewUser);

app.post('/api/new-book', upload.single('image'), BookModule.createBook);

app.post('/api/order-item', OrderModule.addOrderItem);

app.get('/api/orders', OrderModule.getAllOrderItems);

app.get('/api/books', BookModule.getAllBooks);

app.put('/api/order-item/:orderId', OrderModule.editOrderItem);

app.put('/api/books/:bookId', BookModule.editBook);

app.get('/api/suppliers', SupplierModule.getAllSuppliers);

app.get('/api/users', UserModule.getAllUsers);

app.get('/api/languages', BookModule.getLanguages);

app.get('/api/sales-reports', ReportsModule.getSalesReports);

app.get('/api/supplier-report', ReportsModule.getBooksPerSupplierReport);

app.delete('/api/books/:bookId', BookModule.deleteBook);

app.delete('/api/order-item/:orderId', OrderModule.deleteOrderItem);
