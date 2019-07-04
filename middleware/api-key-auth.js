require('dotenv').config();
const { StatusCode } = require('../shared/constants');

/**
 * Validates whether an admin key is present, if so request may proceed.
 * @param req request
 * @param res response
 * @param next next handler
 * @returns {*|*|void} n/a
 */
let validateAdminApiKey = (req, res, next ) => {
    if( !req.headers.admin_api_key ) return res.status(StatusCode.BAD_REQUEST).send("missing headers");

    let key = req.headers.admin_api_key;

    if ( key === process.env.ADMIN_API_KEY ) return next();
    else return res.status(StatusCode.FORBIDDEN).send("invalid api key");
};

module.exports = {
    validateAdminApiKey: validateAdminApiKey,
};