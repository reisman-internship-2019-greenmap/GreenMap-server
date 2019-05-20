/**
 * Simple ping procedure to ensure server is listening and can talk.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a
 */

const { models, connectDb } = require ('../dal/database');

let ping = async (req, res) => {
    res.status(200).send('Ping!');
};

let getProduct = async (req, res) => {
    let id = req.params.id;

    connectDb().then(async () => {
        // TODO get product logic goes here
        // ***** E.G. ******
        // models.Product.findById(id).
        // then((doc) => {
        //         if(!doc) return res.status(404).send();
        //         else res.status(200).send({ doc });
        //     })
        //     .then(() => {return res.status(200).send('blah')})
        //     .catch(() => res.status(500).send());
        // *****************
        res.status(200).send({ payload: null });
    }).catch((err) => {
        res.status(500).send(err);
    });
};

module.exports =  {
    ping: ping,
    getProduct: getProduct
};






