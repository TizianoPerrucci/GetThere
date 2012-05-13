var express = require('express');
var mongooseAuth = require('mongoose-auth');

var konphyg = require('konphyg')(__dirname + '/config');
var config = konphyg('conf');
var model = require('./routes/model');
model.initialize(config);

app = module.exports = express.createServer();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    //app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'blabla'}));
    app.use(express.methodOverride());
    app.use(mongooseAuth.middleware());
    //app.use(app.router); //Important: do not use app.router, Let express do this upon your first req.
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('test', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    app.set('view options', {
        pretty:true
    });
});

app.configure('production', function () {
    //app.use(express.errorHandler());
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});


mongooseAuth.helpExpress(app);


var search = require('./routes/search.js')(app, model);
var view = require('./routes/lift')(app, model);


var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
