module.exports = function(model, app) {
    var Lift = model.lift();
    var Origin = model.origin();
    var Destination = model.destination();

    app.get(('/'), function (req, res) {
        res.redirect("/lifts");
    });

    app.get('/lifts', function (req, res) {
        Lift.find({}).populate('from').populate('to').run(function (err, lifts) {
            if (err) throw err;
            console.log('Listing lifts: ' + lifts);
            res.render('./lifts/list', {title:'All lifts', lifts:lifts, all:false});
        });
    });


    function getTemplateLift() {
        var lift = new Lift();
        lift.from = new Origin();
        lift.from.coord = [0, 0];
        lift.to = new Destination();
        lift.to.coord = [0, 0];
        return lift;
    }

    app.get("/lifts/new", function (req, res) {
        res.render('./lifts/new', {lift: getTemplateLift()});
    });


    // Get lift
    app.get('/lifts/:id', function (req, res) {
        Lift.findById(req.params.id).populate('from').populate('to').run(function (err, lift) {
            if (err) throw err;
            res.render('./lifts/show', {lift:lift});
        });
    });

    //Edit lift
    app.get("/lifts/:id/edit", function (req, res) {
        Lift.findById(req.params.id).populate('from').populate('to').run(function (err, lift) {
            if (err) throw err;
            res.render('./lifts/edit', {lift:lift});
        });
    });


    //Create lift
    app.post('/lifts', function (req, res) {
        var postData = req.body.lift;

        var lift = new Lift();
        lift.date = postData.date;
        lift.time = postData.time;
        lift.time_flexibility = postData.time_flexibility;

        var origin = new Origin();
        origin.city = postData.from;
        origin.coord = [+postData.from_lng, +postData.from_lat];

        var dest = new Destination();
        dest.city = postData.to;
        dest.coord = [+postData.to_lng, +postData.to_lat];

        lift.saveWith(origin, dest, function() {
            res.redirect('/lifts');
        });
    });

    //Update lift
    app.put('/lifts/:id', function (req, res) {
        var postData = req.body.lift;

        Lift.findById(req.params.id).populate('from').populate('to').run(function (err, lift) {
            if (err) throw err;

            lift.date = postData.date;
            lift.time = postData.time;
            lift.time_flexibility = postData.time_flexibility;

            var origin = lift.from;
            origin.city = postData.from;
            origin.coord = [+postData.from_lng, +postData.from_lat];

            var dest = lift.to;
            dest.city = postData.to;
            dest.coord = [+postData.to_lng, +postData.to_lat];

            lift.saveWith(origin, dest, function() {
                res.redirect('/lifts');
            });
        })
    });


    //Delete lift
    app.get('/lifts/:id/delete', function (req, res) {
        Lift.findById(req.params.id).populate('from').populate('to').run(function (err, lift) {
            if (err) throw err;

            lift.removeAll(function() {
                res.redirect('/lifts');
            })
        });
    });

    //Search lift
    app.get("/search", function (req, res) {
        res.render('./lifts/search');
    });

};
