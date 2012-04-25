var config = {};

config.mongo = {};
config.mongo.dbUri = 'mongodb://localhost/lift-dev';

config.web = {};
config.web.port = process.env.PORT || 8080;

module.exports = config;