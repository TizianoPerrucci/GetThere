var mongoose = require('mongoose'),
        liftModel = require('./model.js');


module.exports = {
    define: function (app) {

        liftModel.defineModel(mongoose, function () {
            mongoose.connect(app.set('db-uri'));
        });

        var Lift = mongoose.model('Lift');

        app.get(('/'), function (req, res) {
            res.redirect("/lifts");
        });

        app.get('/lifts', function (req, res) {
            Lift.find({}, function (err, lifts) {
                if (err) throw err;
                console.log('Lifts: ' + lifts);
                res.render('./lifts/list', {title: 'All lifts', lifts: lifts, all: false});
            });
        });

        app.get("/lifts/new", function (req, res) {
            res.render('./lifts/new', {lift:new Lift()});
        });

        // Get lift
        app.get('/lifts/:id', function (req, res) {
            Lift.findById(req.params.id, function (err, lift) {
                if (err) throw err;
                console.log('Lift: ' + lift);
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
            lift.to = postData.to;
            lift.date = postData.date;
            lift.time = postData.time;
            lift.time_flexibility = postData.time_flexibility;

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
                lift.to = postData.to;
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
            //start with and ignore case
            Lift.find({from: { $regex : from + '.*', $options: 'i' } }, function (err, lifts) {
                if (err) throw err;
                console.log('Lifts: ' + lifts);
                res.render('./lifts/list', {title: 'Lift from: \'from\'',lifts: lifts, all: true});
            });
        });

    }
};
