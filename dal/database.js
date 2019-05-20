const mongoose = require('mongoose');
const Product = require('../schemas/product');
const server = process.env.DATABASE_URL || '127.0.0.1';
const database = process.env.DATABASE_NAME || 'test';

const connectDb = () => {
    mongoose.set('useCreateIndex', true);
    return mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true } );
};

const models = { Product };

module.exports = {
    models: models,
    connectDb: connectDb
};