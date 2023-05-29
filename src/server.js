const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();
app.use(bodyParser.json());
console.log('config', config);
app.listen(config.serverPort, () => {
    console.log(`Server started on port ${config.serverPort}`);
});

const authModule = require('./modules/auth');
const BookModule = require('./modules/book');
const OrderModule = require('./modules/order');
const SupplierModule = require('./modules/supplier');
const UserModule = require('./modules/user');

app.post('/api/login', authModule.login);

app.post('/api/signup', authModule.createNewUser);

app.post('/api/new-book', BookModule.createBook);

app.post('/api/order-item', OrderModule.addOrderItem);

app.get('/api/orders', OrderModule.getAllOrderItems);

app.get('/api/books', BookModule.getAllBooks);

app.get('/api/suppliers', SupplierModule.getAllSuppliers);

app.get('/api/users', UserModule.getAllUsers);

app.get('/api/languages', BookModule.getLanguages);
