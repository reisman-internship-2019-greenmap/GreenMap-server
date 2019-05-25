const mongoose = require('mongoose');

let Product = mongoose.model("Product", {
  barcodeId: {
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
    // Optional by default
  }
});

module.exports = Product;