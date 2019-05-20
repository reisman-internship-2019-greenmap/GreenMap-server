const mongoose = require('mongoose');

let Product = mongoose.model("Product", {
  product: {
    type: String,
    required: true
  },
  manufacturers: {
    type: Array,
    required: true
  }
});

module.exports = Product;