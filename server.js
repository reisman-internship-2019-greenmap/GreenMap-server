/**
 * Core server imports.
 */

const mongoose = require('mongoose');
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    Config = require('./Config'),
    port = process.env.PORT || 3000,
    routes = require('./routes');
    productRoute = require('./routes/products');

// Map global promise
mongoose.Promise = global.Promise;
mongodbUrl = 'mongodb://localhost:27017/product-test';

// Set up connection to Mongoose
mongoose.connect(mongodbUrl, {useNewUrlParser: true});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Config.AccessControl);

app.use('/products', productRoute);

routes(app); // link routes to express app
app.listen(port);

console.log(`Listening on port ${port}...`);

module.exports = {app};
