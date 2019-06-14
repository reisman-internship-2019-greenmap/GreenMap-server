const { models, connectDb } = require('../dal/database');
const { StatusCode } = require('../shared/constants');


/**
 * Helper method to insert a Product into the collection
 */
exports.insertProduct = function(body, barcode, res) {

  let newProduct = new models.Product ({
    barcode: barcode,
    name: body.name,
    category: body.categories,
    manufacturer: body.manufacturer || body.brand,
    ESG: null
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

exports.getSimilarCategory = function(category, res) {
  connectDb().then(async () => {
    try {
      let docs = await models.Product.aggregate([
        {$match: {
          'category': category,
          "ESG":{$ne:null}
        }},
        {$group: {
          _id: '$manufacturer',
          manufacturer: { "$first" : "$manufacturer"},
          ESG: { "$first": "$ESG" }
        }},
        { $sort: { "ESG": -1 } },
        { $limit: 5 },
        { $project : {
          _id : 0
        }}
      ]);
      if(docs) {
        console.log(docs);
        return res.status(StatusCode.OK).send({docs});
      }
    } catch(err) {
      console.error(err);
      return res.status(StatusCode.BAD_REQUEST).send(err);
    }

  }).catch((err) => {
    console.error(err);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
  });
}