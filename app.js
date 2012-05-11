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
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('test', function () {
    app.set('view options', {
        pretty:true
    });
});

app.configure('production', function () {
    //app.use(express.errorHandler());
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});


var konphyg = require('konphyg')(__dirname + '/config');
var config = konphyg('conf');


var model = require('./routes/model');
model.initialize(config);

var search = require('./routes/search.js')(app, model);
var view = require('./routes/lift')(app, model);


var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
