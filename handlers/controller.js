/**
 * Simple ping procedure to ensure server is listening and can talk.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */

const { models, connectDb } = require ('../dal/database');
const barcodeUtils = require('../utils/barcode');

let ping = async (req, res) => {
    res.status(200).send('Ping!');
};

let getProduct = async (req, res) => {
    let barcodeId = req.params.id;

    connectDb().then(async () => {
        models.Product.findOne({ barcodeId })
            .then((doc) => {
                if(!doc) {
                    return res.status(404).send();
                }
                res.status(200).send({ doc });
            }).catch((e) => {
                res.status(400).send();
            });
    }).catch((err) => {
        res.status(500).send(err);
    });
};

let addProduct = async(req, res) => {

};

module.exports =  {
    ping: ping,
    getProduct: getProduct,
    addProduct: addProduct
};






