const express = require('express');
const router = express.Router();
const {ObjectID} = require('mongodb');
const {Product} = require('./../models/product');

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

module.exports = router;
