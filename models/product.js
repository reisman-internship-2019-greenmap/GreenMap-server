const mongoose = require('mongoose');

var Product = mongoose.model("Product", {
  name: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});

module.exports = {Product};