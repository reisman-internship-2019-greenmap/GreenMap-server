require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../schemas/product');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

const connectDb = () => {
    mongoose.set('useCreateIndex', true);
    return mongoose.connect(uri, { useNewUrlParser: true } );
};

const models = { Product };

module.exports = {
    models: models,
    connectDb: connectDb
};