/**
 * Server configurations.
 * Requests from any origin are permitted - necessary for multiple users, and multiple devices.
 * CRUD operations GET & POST are accepted.
 * @type {{AccessControl(*, *, *): void}}
 */
const Config = {
    AccessControl(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST'
        );
        res.header(
            'Access-Control-Allow-Headers',
            'X-Requested-With, content-type'
        );
        res.header('Access-Control-Allow-Credentials', true);
        next();
    }
};

module.exports = Config;