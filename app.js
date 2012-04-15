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
    app.set('db-uri', 'mongodb://mongo:mongo00@ds031747.mongolab.com:31747/heroku_app3798339');
    app.use(express.errorHandler());
});


var lift = require('./routes/lift.js');
lift.initialize(app);


var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


var nowjs = require("now");
var everyone = nowjs.initialize(app, {clientWrite: true, socketio: {'log level': 2, transports: ['xhr-polling', 'jsonp-polling']}});

everyone.now.searchLift = function(from, to, date) {
    var self = this;
    console.log('received query - from: ' +from + ", to: " + to+ " ,date: " +date);

    var query = app.Lift.find({from:new RegExp('^' + from + '.*', 'i'),to:new RegExp('^' + to + '.*', 'i'),date:date});
    query.run(function(err, lifts) {
        if (err) throw err;
        console.log('Search lifts: ' + lifts);
        //answer to client
        self.now.showSearchResult(lifts);
    });
};