//const mongoose = require('mongoose');

const Product = require('./models.js');

var mongoDBurl = 'mongodb://localhost/test';

//connecting with the mongodb database
mongoose.connect(mongoDBurl, { useNewUrlParser: true });

//Creating a new product
let newProduct = Product({
    name: 'Pixel 3',
    manufacturer: 'Google',
    type: 'Smartphone'
});

//saving the product
newProduct.save()
  .then((result) => {
    console.log("Product added successfully!");
  }).catch((err) => {
    console.log(err);
  });

//Making a findOne query
Product.findOne({name: 'Pixel 3'})
  .then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });

// might give null initially since adding and querying are both done asynchronously