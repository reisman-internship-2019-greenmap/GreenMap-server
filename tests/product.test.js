const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const { models, connectDb } = require ('../dal/database');

// dummy documents
const products = [{
  _id: new ObjectID(),
  product: 'mobile phone',
  manufacturers: ["Samsung", "AT&T", "LG Electronics"]
}, {
  _id: new ObjectID(),
  product: 'smartphone',
  manufacturers: ["Nokia", "Lenovo", "Oppo"]
}];

// runs before each test cases - populates the collection with the dummy documents after deleting all the documents from the collection
beforeEach((done) => {
  done();
});

// Test suite
describe('GET /products/:id', () => {
});

