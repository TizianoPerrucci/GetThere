var config = {};

config.mongo = {};
config.mongo.dbUri = 'mongodb://mongo:mongo00@ds031747.mongolab.com:31747/heroku_app3798339';

config.web = {};
config.web.port = process.env.PORT || 8080;

module.exports = config;