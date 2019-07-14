require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../schemas/product');
const uri = 'mongodb://localhost:27017/test' || process.env.MONGODB_URI;

const connectDb = () => {
    mongoose.set('useCreateIndex', true);
    return mongoose.connect(uri, { useNewUrlParser: true } );
};

const models = { Product };

module.exports = {
    models: models,
    connectDb: connectDb
};