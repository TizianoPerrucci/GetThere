var mongoose = require('mongoose'),
        liftModel = require('./model.js'),
        deferred = require('deferred');


module.exports = {
    initialize:function (app) {

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
            lift.from_coord.lng = +postData.from_lng;
            lift.from_coord.lat = +postData.from_lat;
            lift.to = postData.to;
            lift.to_coord.lng = +postData.to_lng;
            lift.to_coord.lat = +postData.to_lat;
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
            var postData = req.body.lift;

            var query = Lift.update({ _id:req.params.id},
                    { $set:{
                        from:postData.from,
                        'from_coord.lng': +postData.from_lng,
                        'from_coord.lat': +postData.from_lat,
                        to:postData.to,
                        'to_coord.lng': +postData.to_lng,
                        'to_coord.lat': +postData.to_lat,
                        date:postData.date,
                        time:postData.time,
                        time_flexibility:postData.time_flexibility
                    }}
            );

            console.log("update query: " + query);

            query.run(function (err, val) {
                if (err) throw err;
                console.log("lift updated: " + val);
                res.redirect('/lifts');
            });

            /*
             deferred.promisifyAsync(query.run, 2)(
             function (val) {
             console.log("result: " + val);
             res.redirect('/lifts');
             }).end();

             Lift.promise(query)( function (mongoosePromise) {
             console.log('Lift updated: ' + mongoosePromise);
             console.log('Lift updated: ' + mongoosePromise.constructor);
             console.log('Lift updated: ' + mongoosePromise.complete());
             res.redirect('/lifts');
             }).end();
             */

        });

        //Delete lift
        app.get('/lifts/:id/delete', function (req, res) {

            var query = Lift.remove({ _id:req.params.id });

            query.run(function (err, val) {
                if (err) throw err;
                console.log("lift removed: " + val);
                res.redirect('/lifts');
            });

            /*
             Lift.promise(query)(
             function (mongoosePromise) {
             console.log('lift deleted: ' + mongoosePromise);
             res.redirect('/lifts');
             }).end();
             */
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
