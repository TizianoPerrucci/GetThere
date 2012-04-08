/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function Lift(where, when){}

var inMemoryData = new Array();


app.get('/lifts', function (req, res) {
    res.render('./lifts/list', {lifts: inMemoryData});
});

app.get("/lifts/new", function (req, res) {
    res.render('./lifts/new', {lift: new Lift()} );
});

app.get('/lifts/:id', function (req, res) {
    var id = req.params.id;
    res.render('./lifts/show', {lift: inMemoryData[id]} );
});

app.get("/lifts/:id/edit", function (req, res) {
    var id = req.params.id;
    res.render('./lifts/edit', {lift: inMemoryData[id], id: id} );
});


//Create lift
app.post('/lifts', function (req, res) {
    var lift = req.body.lift;
    inMemoryData.push(lift);

    console.log('Received creation for lift: where ' + lift.where + ' - when ' + lift.when);

    res.redirect('/lifts');
});

//Update lift
app.put('/lifts/:id', function (req, res) {
    var lift = req.body.lift;
    var id = req.params.id;
    inMemoryData[id] = lift;

    console.log('Received update for lift ' + id + ': where ' + lift.where + ' - when ' + lift.when);

    res.redirect('/lifts');
});

//Delete lift
app.del('/lifts/:id', function (req, res) {
    var id = req.params.id;
    inMemoryData[id] = null;

    console.log('Received delete lift ' + id);

    res.redirect('/lifts');
});




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(8080, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
