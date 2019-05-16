const express = require('express');
const wdk = require('wikidata-sdk');
const rp = require('request-promise');

const router = express.Router();
const {ObjectID} = require('mongodb');
const {Product} = require('./../models/product');

// POST request to add a document to the database
router.post('/', (req, res) => {
	var product = new Product({
		product: req.body.product,
		manufacturers: req.body.manufacturers
	});

	product.save()
		.then((doc) => {
			res.send(doc);
		}).catch((e) => {
			res.status(400).send(e);
		});
});

// GET request for fetching an individual document
router.get('/:id', (req, res) => {
  var id = req.params.id;

	// If the id passed is not valid
	if(!ObjectID.isValid(id)) {
		return res.status(404).send();
	}
	Product.findById(id)
		.then((doc) => {
			// If document does not exist
			if(!doc) {
				return res.status(404).send();
			}
			res.send({doc});
		}).catch((e) => {
			res.status(400).send();
		});
});


router.get('/', (req, res) => {
	var productType = req.query.product;

	Product.findOne({product: productType})
		.then((doc) => {
			if(!doc) {
				const SPARQL = `
        SELECT ?manufacturerLabel
        WHERE
        {
          ?product ?label \"` + productType + `\"@en.
          ?manufacturer wdt:P1056 ?product.
          SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        }`
				const url = wdk.sparqlQuery(SPARQL);

				rp(url)
					.then((body) => {
						var manufacturers = [];
						wikiProduct = wdk.simplify.sparqlResults(body);

						if(wikiProduct.length < 1) {
							return res.status(400).send();
						}

						for(let i = 0; i < wikiProduct.length; i++) {
							manufacturers[i] = wikiProduct[i].manufacturerLabel;
						}
						
						var product = new Product({
							product: productType,
							manufacturers
						});
						product.save()
							.then((product) => {
								res.send({product});
							}).catch((e) => {
								return res.status(400).send(e);
							});
					}).catch((e) => {
						return res.send(400).send();
					});
			} else {
				return res.send({doc});
			}
		}).catch((e) => {
			res.status(400).send();
		});
});

module.exports = router;
