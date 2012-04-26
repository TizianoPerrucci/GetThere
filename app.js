var express = require('express'),
        app = module.exports = express.createServer();


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    //app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.set('db-uri', 'mongodb://localhost/lift-dev');
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('test', function () {
    app.set('db-uri', 'mongodb://localhost/lift-test');
    app.set('view options', {
        pretty:true
    });
});

app.configure('production', function () {
    app.set('db-uri', 'mongodb://mongo:mongo00@ds031747.mongolab.com:31747/heroku_app3798339');
    app.use(express.errorHandler());
});


//TODO conf
var config = require('./config/dev.js');

var model = require('./routes/model');
model.initialize(config);

var view = require('./routes/lift')(model, app);


app.listen(config.web.port, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


var search = require('./routes/search.js')(app);