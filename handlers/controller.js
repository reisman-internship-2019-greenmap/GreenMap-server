require('dotenv').config();
const bc = require('barcodelookup');
const { models, connectDb } = require('../dal/database');
const { StatusCode } = require('../shared/constants');
const Product = require('../schemas/product');


/**
 * Simple ping endpoint.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let ping = (req, res) => {
    res.status(StatusCode.EASTER_EGG).send('Ping!');
};

let welcome = (req, res) => {
    res.status(StatusCode.EASTER_EGG).send('Welcome to the Greenmap-API!');
};

/**
 * Gets product from DAL - if not found it is retrieved from Barcodelookup and then stored in MongoDB.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let getProduct = (req, res) => {
    connectDb().then(async () => {
        if (!req.params.id)
            return res.status(StatusCode.PRECONDITION_FAILED).send(null);
        // else
        let barcode = req.params.id;
        try {
            // search for product in MongoDB
            let doc = await models.Product.findOne({barcode});
            if (doc) {
                console.log(`found ${doc.barcode} in mongodb`);
                return res.status(StatusCode.OK).send({doc});
            }

            // else query barcodelookup for product
            let bclRes = await bc.lookup({key: process.env.BC_API_KEY, barcode: barcode});
            if (bclRes.statusCode !== StatusCode.OK) {
                console.error(`error looking up ${barcode} in barcodelookup`);
                return res.status(bclRes.statusCode).send({ data: bclRes.data });
            }

            let newProduct = new Product ({
                barcode: barcode,
                name: bclRes.data.product_name,
                category: bclRes.data.category,
                manufacturer: bclRes.data.manufacturer,
                ESG: "0"
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

        } catch(err) {
            console.error(err);
            return res.status(StatusCode.BAD_REQUEST).send(err);
        }
    }).catch((err) => {
        console.error(err);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    });
};

let addProductByLookup = async(req, res) => {
    connectDb().then(async () => {
        if (!req.query.barcode)
            return res.status(StatusCode.PRECONDITION_FAILED).send(null);
        // else
        let barcode = req.query.barcode;
        let doc = await models.Product.findOne({ barcode });
        if (doc) {
            console.error(`product ${req.query.barcode} already exists in database`);
            return res.status(StatusCode.CONFLICT).send({msg: `product ${req.query.barcode} already exists in database`});
        }
        // else
        // query barcodelookup for product
        let bclRes = await bc.lookup({key: process.env.BC_API_KEY, barcode: barcode});
        if(bclRes.statusCode !== StatusCode.OK) {
            console.error(`error looking up ${barcode} in barcodelookup`);
            return res.status(bclRes.statusCode).send({ data: bclRes.data });
        }

        let newProduct = new Product ({
            barcode: req.query.barcode,
            name: bclRes.data.product_name,
            category: bclRes.data.category,
            manufacturer: bclRes.data.manufacturer,
            ESG: "0"
        });

        // save new product to MongoDB
        newProduct.save((err, data) => {
            if (err) {
                console.error(err);
                return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
            }
            // else
            console.log(`stored ${data} in mongodb`);
            return res.status(StatusCode.CREATED).send(newProduct);
        });
    });
};

let addProductByValue = (req, res, next) => {
    connectDb().then(async () => {
        if (req.query.barcode && !req.query.name && !req.query.category && !req.query.manufacturer) {
            return next(); // to addProductByLookup
        }
        else if (!req.query.barcode && !req.query.name && !req.query.category && !req.query.manufacturer)
            return res.status(StatusCode.PRECONDITION_FAILED).send(null);
        // else
        let doc = await models.Product.findOne(req.query.barcode);
        if (doc) {
            console.error(`product ${req.body.barcode} already exists in database`);
            return res.status(StatusCode.CONFLICT).send({msg: `product ${doc.body.barcode} already exists in database`});
        }
        // else
        let newProduct = new Product({
            barcode: req.query.barcode,
            name: req.query.product_name,
            category: req.query.category,
            manufacturer: req.query.manufacturer,
            ESG: "0"
        });

        // save new product to MongoDB
        newProduct.save((err, data) => {
            if (err) {
                console.error(err);
                return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
            }
            // else
            console.log(`stored ${data} in mongodb`);
            return res.status(StatusCode.CREATED).send(newProduct);
        });
    })
};

module.exports =  {
    ping: ping,
    welcome: welcome,
    getProduct: getProduct,
    addProductByLookup: addProductByLookup,
    addProductByValue: addProductByValue
};