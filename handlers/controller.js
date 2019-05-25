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
let ping = async (req, res) => {
    res.status(StatusCode.EASTER_EGG).send('Ping!');
};

/**
 * Gets product from DAL - if not found it is retrieved from Barcodelookup and then stored in MongoDB.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let getProduct = async (req, res) => {
    let barcode = req.params.id;

    connectDb().then(async () => {
        try {
            // search for product in MongoDB
            let doc = await models.Product.findOne({barcode});
            if(doc) {
                console.log(`found ${doc.barcode} in mongodb`);
                return res.status(StatusCode.OK).send({doc});
            }

            // else query barcodelookup for product
            let bclRes = await bc.lookup({key: process.env.API_KEY, barcode: barcode});
            if(bclRes.statusCode !== StatusCode.OK) {
                console.error(`error looking up ${barcode} in barcodelookup`);
                return res.status(bclRes.statusCode).send({ data: bclRes.data });
            }

            let manufacturer;

            if (bclRes.data.manufacturer)
                manufacturer = bclRes.data.manufacturer;
            else if (bclRes.data.brand)
                manufacturer = bclRes.data.brand;
            else
                console.error(`cannot find a manufacturer for ${barcode}`);

            let newProduct = new Product ({
                barcode: barcode,
                name: bclRes.data.product_name,
                category: bclRes.data.category,
                manufacturer: manufacturer,
                ESG: "0"
            });

            // save new product to MongoDB
            newProduct.save( (err, data) => {
                if(err) {
                    console.error(err);
                    return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
                }
                // else
                console.log(`stored ${data} in mongodb`);
                return res.status(StatusCode.CREATED).send(newProduct);
            });

        } catch (err) {
            console.error(err);
            return res.status(StatusCode.BAD_REQUEST).send(err);
        }
    }).catch((err) => {
        console.error(err);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    });
};

let addProduct = async(req, res) => {

};

module.exports =  {
    ping: ping,
    getProduct: getProduct,
    addProduct: addProduct
};