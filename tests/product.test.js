const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Product} = require('../schemas/product');

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
  Product.deleteMany({})
    .then(() => {
      return Product.insertMany(products);
    }).then(() => {
      done();
    });
});

// Test suite
describe('GET /products/:id', () => {
  // Test case
  it('should return product document', (done) => {
    request(app)
      .get(`/products/${products[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.doc.name).toBe(products[0].name);
      })
      .end(done);
  });

  // Test case
  it('should return a 404 if product is not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .get(`/products/${hexId}`)
      .expect(404)
      .end(done);
  });

  // Test case
  it('should return 404 for invalid ObjectID', (done) => {
    var invalidId = '123';
    request(app)
      .get(`/products/${invalidId}`)
      .expect(404)
      .end(done);
  })
});

