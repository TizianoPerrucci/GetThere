/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes');

var app = module.exports = express.createServer();

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
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/user/:id', function (req, res) {
    res.send('user ' + req.params.id);
});


function loadUser(req, res, next) {
    // You would fetch your user from the db
    var user = users[req.params.id];
    if (user) {
        req.user = user;
        next();
    } else {
        next(new Error('Failed to load user ' + req.params.id));
    }
}

app.get('/user/:id', loadUser, function (req, res) {
    res.send('Viewing user ' + req.user.name);
});


app.put('/postexample', function (req, res) {
    console.log(req.body.user);
    res.redirect('back');
});


app.listen(8080, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
