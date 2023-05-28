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

app.post('/api/login', authModule.login);

app.post('/api/signup', authModule.createNewUser);

app.post('/api/new-book', BookModule.createBook);

app.post('/api/books', BookModule.getAllBooks);

app.post('/api/order-item', OrderModule.addOrderItem);

app.post('/api/orders', OrderModule.getAllOrderItems);
