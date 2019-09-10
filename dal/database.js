require('dotenv').config();
const mongoose = require('mongoose');
const {Product} = require('../schemas/product');
const {Company} = require('../schemas/company');
const uri = 'mongodb://localhost:27017/test' || '127.0.0.1';

const connectDb = (m) => {
    mongoose.set('useCreateIndex', true);
    return mongoose.connect(uri, { useNewUrlParser: true } );
};

const models = { Product, Company };

module.exports = {
    models: models,
    connectDb: connectDb
};