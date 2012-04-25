var should = require('should');

var config = require('../config/test');
var model = require('../routes/model');


describe('Lift model', function () {
    model.initialize(config);

    var Lift = model.lift();
    var Origin = model.origin();
    var Destination = model.destination();

    beforeEach(function (done) {
        Origin.remove({}, function() {
            Destination.remove({}, function() {
                Lift.remove({}, function() {
                    done();
                })
            })
        })
    })

    function defaultLift(callback) {
        var lift = new Lift();
        lift.date = '05/05/2012';
        lift.time = '10:00';
        lift.time_flexibility = '1h';

        var origin = new Origin();
        origin.city = 'Leiderdorp, The Netherlands';
        origin.coord.lng = 4.533165899999972;
        origin.coord.lat = 52.160183;

        var dest = new Destination();
        dest.city = 'Rotterdam, The Netherlands';
        dest.coord.lng = 4.481775999999968;
        dest.coord.lat = 51.92421599999999;

        lift.saveWith(origin, dest, function() {

            //TODO use findById
            Lift.findOne({})
                    .populate('from')
                    .populate('to')
                    .run(function (err, lift) {
                        if (err) throw done(err);

                        callback(lift);
                    })
        })
    }

    function defaultLifts(cb) {

        var lift = new Lift();
        lift.date = '05/05/2012';
        lift.time = '10:00';
        lift.time_flexibility = '1h';

        var origin = new Origin();
        origin.city = 'Leiderdorp, The Netherlands';
        origin.coord.lng = 4.533165899999972;
        origin.coord.lat = 52.160183;

        var dest = new Destination();
        dest.city = 'Rotterdam, The Netherlands';
        dest.coord.lng = 4.481775999999968;
        dest.coord.lat = 51.92421599999999;

        lift.saveWith(origin, dest, function(){
            var lift2 = new Lift();
            lift2.date = '05/05/2012';
            lift2.time = '10:00';
            lift2.time_flexibility = '1h';

            var origin2 = new Origin();
            origin.city = 'Rome, Italy';
            origin.coord.lng = 12.494888;
            origin.coord.lat = 41.892566;

            var dest2 = new Destination();
            dest.city = 'Bucchianico, Italy';
            dest.coord.lng = 14.182741999999962;
            dest.coord.lat = 51.92421599999999;

            lift2.saveWith(origin2, dest2, function(){
                cb();
            });
        });

    }

    it('should save', function(done){
        defaultLift(function(lift){
            console.log('Created lift: ', lift);

            lift.from.city.should.equal("Leiderdorp, The Netherlands");
            lift.to.city.should.equal("Rotterdam, The Netherlands");

            done();
        })
    })

    it('should update', function(done) {
        defaultLift(function(lift){
            lift.date = '01/01/2013';

            var origin = lift.from;
            origin.city = 'Bucchianico, Italy';
            origin.coord.lng = 14.182741999999962;
            origin.coord.lat = 42.3058632;

            lift.saveWith(origin, lift.to, function() {
                Lift.findOne({})
                        .populate('from')
                        .populate('to')
                        .run(function (err, res) {
                            if (err) throw done(err);

                            console.log('Updated lift: ', res);

                            res.date.should.equal('01/01/2013');
                            res.from.city.should.equal("Bucchianico, Italy");

                            done();
                        })
            })
        })
    })

    it('should remove', function(done) {
        defaultLift(function(lift) {
            lift.removeAll(function() {

                Lift.findOne({}, function (err, l) {
                    if (err) throw done(err);

                    should.not.exist(l);
                    Origin.findOne({}, function (err, o) {
                        if (err) throw done(err);

                        should.not.exist(o);
                        Destination.findOne({}, function (err, d) {
                            if (err) throw done(err);

                            should.not.exist(d);
                            done();
                        })
                    })
                })
            })
        })
    })

    it('should search by distance', function(done) {
        defaultLifts(function() {

            //[lat, lng]
            var nearFrom = [50, 4];
            var nearTo = [50, 4];
            model.searchByDistance(nearFrom, nearTo, 5, function(lifts) {
                lifts.should.have.length(1);

                done();
            })
        })
    })

});