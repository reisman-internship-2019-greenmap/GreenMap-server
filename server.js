/**
 * Core server requirements.
 */
require('dotenv').config();
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    Config = require('./Config'),
    port = process.env.PORT || 3000,
    routes = require('./routes/routes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Config.AccessControl);
routes(app); // link routes to express app
app.listen(port);

console.log(`Listening on port ${port}...`);

module.exports = {app};
