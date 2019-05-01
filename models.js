const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
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
})

module.exports = mongoose.model('Product', ProductSchema);