var should = require('should');

var config = require('../config/test');
var model = require('../routes/model');


describe('Lift model', function () {
    model.initialize(config);

    var Lift = model.lift();
    var Origin = model.origin();
    var Destination = model.destination();

    beforeEach(function (done) {
        Origin.remove({}, function () {
            Destination.remove({}, function () {
                Lift.remove({}, function () {
                    done();
                })
            })
        })
    })

    function insertGenericLift(coord, callback) {
        //dest.city = 'Rotterdam, The Netherlands';
        //dest.coord.lng = 4.481775999999968;
        //dest.coord.lat = 51.92421599999999;
        //origin.city = 'Bucchianico, Italy';
        //origin.coord.lng = 14.182741999999962;
        //origin.coord.lat = 42.3058632;

        var lift = new Lift();
        lift.date = '05/05/2012';
        lift.time = '10:00';
        lift.time_flexibility = '1h';

        var origin = new Origin();
        origin.city = coord.f;
        origin.coord.lng = coord.flng;
        origin.coord.lat = coord.flat;

        var dest = new Destination();
        dest.city = coord.t;
        dest.coord.lng = coord.tlng;
        dest.coord.lat = coord.tlat;

        lift.saveWith(origin, dest, function (l) {
            Lift.findById(lift._id)
                    .populate('from')
                    .populate('to')
                    .run(function (err, lift) {
                        if (err) throw done(err);

                        callback(lift);
                    })
        })
    }

    it('should save', function (done) {
        var coord = {f:'a', flng:1, flat:2, t:'b', tlng:1, tlat:2}
        insertGenericLift(coord, function (lift) {
            console.log('Created lift: ', lift);

            lift.from.city.should.equal("a");
            lift.to.city.should.equal("b");

            done();
        })
    })

    it('should update', function (done) {
        var coord = {f:'a', flng:1, flat:2, t:'b', tlng:1, tlat:2}
        insertGenericLift(coord, function (lift) {
            lift.date = '01/01/2013';

            var origin = lift.from;
            origin.city = 'Bucchianico, Italy';
            origin.coord.lng = 14.182741999999962;
            origin.coord.lat = 42.3058632;

            lift.saveWith(origin, lift.to, function () {
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

    it('should remove', function (done) {
        var coord = {f:'a', flng:1, flat:2, t:'b', tlng:1, tlat:2}
        insertGenericLift(coord, function (lift) {
            lift.removeAll(function () {

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

    it('should search by distance', function (done) {
        var coord1 = {f:'a', flat:6, flng:11, t:'b', tlat:36, tlng:46};
        insertGenericLift(coord1, function (lift) {
            var coord2 = {f:'c', flat:4, flng:9, t:'d', tlat:34, tlng:44};
            insertGenericLift(coord2, function (lift) {

                //[lat, lng]
                var nearFrom = [5, 10];
                var nearTo = [35, 45];
                model.searchByDistance(nearFrom, nearTo, 10, function (lifts) {
                    lifts.should.have.length(2);

                    done();
                })

            })
        })

    })

})