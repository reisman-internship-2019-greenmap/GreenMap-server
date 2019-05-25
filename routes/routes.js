'use strict';
const controller = require('../handlers/controller');
/**
 * Exports app routes.
 * This convention enables developers to chain CRUD operations with distinct controllers to
 * single routes.
 * @param app
 */
module.exports = (app) => {
    app.route('/ping').get(controller.ping).post(controller.ping);
    app.route('/:id').get(controller.getProduct);
    app.route('/').get(controller.welcome).post(controller.addProductByValue).post(controller.addProductByLookup);
};
