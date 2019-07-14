const { models } = require('../dal/database');
const { StatusCode } = require('../shared/constants');
const { greenScoreLookup } = require('./wikirates');

/**
 * Helper method to insert a Product into the collection
 */


exports.insertProduct = function(body, barcode, res) {
  let newProduct = new models.Product ({
    barcode: barcode,
    name: body.name,
    category: body.categories,
    manufacturer: body.manufacturer || body.brand,
    ESG: greenScoreLookup({manufacturer: body.manufacturer || body.brand })
  });

  // save new product to MongoDB
  newProduct.save( (err, data) => {
    if (err) {
      console.error(err);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    }
    // else return new product
    console.log(`stored ${data} in mongodb`);
    return res.status(StatusCode.CREATED).send(newProduct);
  });
}
