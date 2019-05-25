const expect = require('expect');
const { models, connectDb } = require ('../dal/database');

// dummy documents
const products = [{
  barcode: "8152210266539",
  name: "Macbook Pro 2018",
  category: "laptop",
  manufacturer: "Apple",
  ESG: "100"
}, {
  barcode: "07350053850019",
  name: "Microsoft Surface Pro 6",
  category: "laptop",
  manufacturer: "Microsoft",
  ESG: "80"
}];

// runs before each test cases - populates the collection with the dummy documents after deleting all the documents from the collection
beforeEach((done) => {
  done();
});

// Test suite
describe('GET /products/:id', () => {
});

