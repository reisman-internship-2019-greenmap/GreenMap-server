const mongoose = require('mongoose');

let Product = mongoose.model("Product", {
  barcode: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  ESG: {
    type: String,
    required: true
  }
});

module.exports = Product;