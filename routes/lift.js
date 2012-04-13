var mongoose = require('mongoose'),
        liftModel = require('./model.js');


module.exports = {
    define: function (app) {

        liftModel.defineModel(mongoose, function () {
            var dbUri = app.set('db-uri');
            mongoose.connect(dbUri, function (err) {
                if (err) throw err;
                console.log('Mongo connected, uri: ' + dbUri);
            });
        });

        //make model public to all app
        var Lift = app.Lift = mongoose.model('Lift');

        app.get(('/'), function (req, res) {
            res.redirect("/lifts");
        });

        app.get('/lifts', function (req, res) {
            Lift.find({}, function (err, lifts) {
                if (err) throw err;
                console.log('Listing lifts: ' + lifts);
                res.render('./lifts/list', {title:'All lifts', lifts:lifts, all:false});
            });
        });

        app.get("/lifts/new", function (req, res) {
            res.render('./lifts/new', {lift:new Lift()});
        });

        // Get lift
        app.get('/lifts/:id', function (req, res) {
            Lift.findById(req.params.id, function (err, lift) {
                if (err) throw err;
                console.log('Get lift: ' + lift);
                res.render('./lifts/show', {lift:lift});
            });
        });

        //Edit lift
        app.get("/lifts/:id/edit", function (req, res) {
            Lift.findById(req.params.id, function (err, lift) {
                if (err) throw err;
                res.render('./lifts/edit', {lift:lift});
            });
        });


        //Create lift
        app.post('/lifts', function (req, res) {
            var postData = req.body.lift;

            var lift = new Lift();
            lift.from = postData.from;
            lift.from_coord = postData.from_coord;
            lift.to = postData.to;
            lift.to_coord = postData.to_coord;
            lift.date = postData.date;
            lift.time = postData.time;
            lift.time_flexibility = postData.time_flexibility;

            //enrichWithCoordinates(lift);

            lift.save(function (err) {
                if (err) throw err;
                console.log('Lift created: ' + lift);
                res.redirect('/lifts');
            });
        });

        //Update lift
        app.put('/lifts/:id', function (req, res) {
            Lift.findById(req.params.id, function (err, lift) {
                if (err) throw err;

                var postData = req.body.lift;
                lift.from = postData.from;
                lift.from_coord = postData.from_coord;
                lift.to = postData.to;
                lift.to_coord = postData.to_coord;
                lift.date = postData.date;
                lift.time = postData.time;
                lift.time_flexibility = postData.time_flexibility;

                lift.save(function (err, lift) {
                    if (err) throw err;
                    console.log('Lift updated: ' + lift);
                });
            });

            res.redirect('/lifts');
        });

        //Delete lift
        app.get('/lifts/:id/delete', function (req, res) {
            Lift.findById(req.params.id, function (err, lift) {
                if (err) throw err;

                lift.remove(function (err) {
                    if (err) throw err;
                    console.log('lift deleted: ' + lift)
                });
            });

            res.redirect('/lifts');
        });


        //Search lift
        app.get("/search", function (req, res) {
            res.render('./lifts/search');
        });

        app.post("/search", function (req, res) {
            var from = req.body.lift.from;
            var to = req.body.lift.to;
            var date = req.body.lift.date;

            //start with and ignore case
            Lift.find({
                from:new RegExp('^' + from + '.*', 'i'),
                to:new RegExp('^' + to + '.*', 'i'),
                date:date
            }, function (err, lifts) {
                if (err) throw err;
                console.log('Search lifts: ' + lifts);
                res.render('./lifts/list', {title:'Lift from: \'' + from + '\'', lifts:lifts, all:true});
            });
        });


    }
};
