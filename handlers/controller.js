require('dotenv').config();
const { models, connectDb } = require('../dal/database');
const { StatusCode } = require('../shared/constants');

const { insertProduct } = require('../utils/controller');
const { datafinitilookup } = require('../utils/datafiniti');
const { aliasesLookup, greenScoreLookup } = require('../utils/wikirates');
/**
 * Simple ping endpoint.
 * @param req request.
 * @param res response.
 */
let ping = (req, res) => {
    res.status(StatusCode.EASTER_EGG).send('Ping!');
};

/**
 * Simple welcome message for visitors to root url.
 * @param req request.
 * @param res response.
 */
let welcome = (req, res) => {
    res.status(StatusCode.EASTER_EGG).send('Welcome to the Greenmap-API!');
};

/**
 * Gets product from DAL - if not found it is retrieved from Barcodelookup and then stored in MongoDB.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a.
 */
let getProduct = (req, res) => {
    connectDb().then(async () => {
        if (!req.params.id)
            return res.status(StatusCode.PRECONDITION_FAILED).send(null);
        // else
        let barcode = req.params.id;
        let greenScore = null;
        try {
            // search for product in MongoDB
            let doc = await models.Product.findOne({barcode});
            let greenScore = null;
            if (doc) {
                console.log(`found ${doc.barcode} in mongodb`);
                return res.status(StatusCode.OK).send({doc});
            }

            // else query datafiniti for product
            let datafinitiRes = await datafinitilookup({api_key: process.env.API_TOKEN, barcode: barcode});

            if(datafinitiRes.status != StatusCode.OK) {
                console.error(`error looking up ${barcode} in datafiniti`);
                return res.status(datafinitiRes.statusCode).send({ data: datafinitiRes.data });
            }

            if(datafinitiRes.body.num_found == 0) {
                console.error(`couldn't find ${barcode} in datafiniti`);
                return res.status(StatusCode.NOT_FOUND).send({ data: datafinitiRes.body.records[0] });
            }

            if(!('brand' in datafinitiRes.body.records[0]) && !('manufacturer' in datafinitiRes.body.records[0])) {
                console.error(`couldn't find a manufacturer for ${barcode}`);
            } else {
                let companyName = (datafinitiRes.body.records[0].manufacturer || datafinitiRes.body.records[0].brand);
                let companyDoc = await models.Company.findOne({alias: 
                    { $regex: new RegExp("^" + companyName.toLowerCase() + "$", "i") }
                    // (datafinitiRes.body.records[0].manufacturer || datafinitiRes.body.records[0].brand).toLowerCase()}
                });
                if(companyDoc) {
                    console.log(companyDoc);
                    console.log(`found ${companyName} in wikidata`);
                    if(companyDoc.greenscore != null) {
                        greenScore = companyDoc.greenscore;
                    }
                    let record = datafinitiRes.body.records[0];
                    if('categories' in record && record.categories.length > 2) {
                        for(let i = 0; i < record.categories.length - 2; i++) {
                            companyDoc.category.push(record.categories[i]);
                        }
                    } 
                    console.log(companyDoc);
                }          
            }

            insertProduct(datafinitiRes.body.records[0], barcode, res, greenScore);

        } catch(err) {
            console.error(err);
            return res.status(StatusCode.BAD_REQUEST).send(err);
        }
    }).catch((err) => {
        console.error(err);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    });
};

/**
 * Adds a product to the Greenmap Database by value.
 * If only a barcode value is provided, the handler passes on the request to the addProductByLookup controller.
 * @param req request.
 * @param res response.
 * @param next to addProductByLookup.
 * @returns {Promise<void>} n/a.
 */
let addProductByValue = (req, res, next) => {
    connectDb().then(async () => {
        if (req.body.barcode && !req.body.name && !req.body.category && !req.body.manufacturer) {
            return next(); // to addProductByLookup
        }
        else if (!req.body.barcode && !req.body.name && !req.body.category && !req.body.manufacturer)
            return res.status(StatusCode.PRECONDITION_FAILED).send(null);
        // else
        let barcode = req.body.barcode;
        let doc = await models.Product.findOne({ barcode });
        if (doc) {
            console.error(`product ${req.body.barcode} already exists in database`);
            return res.status(StatusCode.CONFLICT).send({msg: `product ${doc.barcode} already exists in database`});
        }
        // else
        insertProduct(req.body, barcode, res);
    })
};

/**
 * Adds a product to the Greenmap Database using a Barcodelookup request.
 * @param req request.
 * @param res response.
 * @returns {Promise<void>} n/a.
 */
let addProductByLookup = async(req, res) => {
    connectDb().then(async () => {
        if (!req.body.barcode)
            return res.status(StatusCode.PRECONDITION_FAILED).send(null);
        // else
        let barcode = req.body.barcode;
        let greenScore = null;
        let doc = await models.Product.findOne({ barcode });
        if (doc) {
            console.error(`product ${req.body.barcode} already exists in database`);
            return res.status(StatusCode.CONFLICT).send({msg: `product ${req.body.barcode} already exists in database`});
        }
        // else query datafiniti for product
        let datafinitiRes = await datafinitilookup({api_key: process.env.API_TOKEN, barcode: barcode});
        if(datafinitiRes.status != StatusCode.OK) {
            console.error(`error looking up ${barcode} in datafiniti`);
            return res.status(bclRes.statusCode).send({ data: bclRes.data });
        }

        if(datafinitiRes.body.num_found == 0) {
            console.error(`couldn't find ${barcode} in datafiniti`);
            return res.status(StatusCode.NOT_FOUND).send({ data: datafinitiRes.body.records[0] });
        }

        if(!('brand' in datafinitiRes.body.records[0]) && !('manufacturer' in datafinitiRes.body.records[0])) {
            console.error(`couldn't find a manufacturer for ${barcode}`);
        } else {
            let companyName = (datafinitiRes.body.records[0].manufacturer || datafinitiRes.body.records[0].brand);
            let companyDoc = await models.Company.findOne({alias: 
                { $regex: new RegExp("^" + companyName.toLowerCase() + "$", "i") }
                // (datafinitiRes.body.records[0].manufacturer || datafinitiRes.body.records[0].brand).toLowerCase()}
            });
            if(companyDoc) {
                console.log(`found company in wikidata`);
                if(companyDoc.sustainable != null) {
                    greenScore = companyDoc.sustainable;
                }
            }          
        }

        insertProduct(datafinitiRes.body.records[0], barcode, res, greenScore);
    });
};


/**
 * Returns the top five manufacturers of the same category of product
 * @param req request 
 * @param res  response
 */
let getTopManufacturers = async(req, res) => {
    connectDb().then(async (db) => {
        if(!req.params.id) {
            return res.status(StatusCode.PRECONDITION_FAILED).send();
        }      
        let barcode = req.params.id;
        try {
            let doc = await models.Product.findOne({ barcode });
            console.log(`found ${doc.barcode} in mongodb`);
            let found = false;

            for(let i = doc.category.length - 1; i >= 0; i--) {
                category = doc.category[i];
                let docs = await db.models.Company.aggregate([
                    {$match: {
                        'category': { $regex: new RegExp("^" + category.toLowerCase() + "$", "i") },
                        "greenscore":{$ne:null}
                    }},
                    {$group: {
                        _id: '$company',
                        Company: { "$first" : "$company"},
                        greenscore: { "$first": "$greenscore" },
                    }},
                    { $sort: { "greenscore": -1 } },
                    { $limit: 5 },
                    { $project : {
                        _id : 0
                    }}
                ]);
                if(docs.length > 0) {
                    found = true;
                    console.log(category);
                    return res.status(StatusCode.OK).send({docs, category});
                }
            }
            if(!found) {
                return res.status(StatusCode.NOT_FOUND).send(err);
            }
        } catch(err) {
            console.error(`barcode ${barcode} not found in the mongodb`);
            return res.status(StatusCode.NOT_FOUND).send(err);
        }
    }).catch((err) => {
        console.error(err);
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    });
};

module.exports =  {
    ping: ping,
    welcome: welcome,
    getProduct: getProduct,
    addProductByValue: addProductByValue,
    addProductByLookup: addProductByLookup,
    getTopManufacturers: getTopManufacturers
};