/**
 * Simple ping procedure to ensure server is listening and can talk.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let ping = async (req, res) => {
    res.status(200);
    res.send('Ping!');
};

module.exports =  {
    ping: ping
};

// -----------------------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const mongoose = require('mongoose');

const {Product} = require('./models/product');

// Map global promise
mongoose.Promise = global.Promise;
mongodbUrl = 'mongodb://localhost:27017/product-test';

var app = express();

// Body parser middleware
app.use(bodyParser.json());

// Set up connection to Mongoose
mongoose.connect(mongodbUrl, {useNewUrlParser: true});

// GET request for fetching an individual document
app.get('/products/:id', (req, res) => {
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

const port = 3000;

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

module.exports = {app};


