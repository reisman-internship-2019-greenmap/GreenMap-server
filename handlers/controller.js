const { models, connectDb } = require ('../dal/database');

/**
 * Simple ping endpoint.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let ping = async (req, res) => {
    res.status(200).send('Ping!');
};

/**
 * Gets product from DAL.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */
let getProduct = async (req, res) => {
    let barcodeId = req.params.id;

    connectDb().then(async () => {
        models.Product.findOne({ barcodeId })
            .then((doc) => {
                if(!doc)
                    return res.status(404).send();
                else
                    res.status(200).send({ doc });
            }).catch((err) => res.status(400).send(err));
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






