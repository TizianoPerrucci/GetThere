/**
 * Module dependencies.
 */

var express = require('express'),
    app = module.exports = express.createServer();

// Configuration

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

app.configure('test', function() {
  app.set('db-uri', 'mongodb://localhost/lift-test');
  app.set('view options', {
    pretty: true
  });
});

app.configure('production', function () {
    app.use(express.errorHandler());
});


require('./routes/lift.js').define(app);


var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});