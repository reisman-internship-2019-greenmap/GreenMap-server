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
    type: Array,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  ESG: {
    type: String
  }
});

let Company = mongoose.model("Company", {
  company: {
    type: String,
    required: true
  },
  alias: {
    type: Array,
    required: true 
  },
  category: {
    type: Array,
    required: true
  },
  greenscore: {
    type: Number
  },
  dow: {
    type: Number
  },
  sustainable: {
    type: String
  }
})

module.exports = {Product, Company};
