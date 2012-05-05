// Environment settings
process.env.NODE_ENV = 'test';

var should = require('should');

var konphyg = require('konphyg')(__dirname + '/../config');
var config = konphyg('conf');

//TODO initialize only once
var model = require('../routes/model');
model.initialize(config);


describe('Lift model', function () {

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

    function insertAndLoad(coord, callback) {
        var lift = new Lift();
        lift.date = '05/05/2012';
        lift.time = '10:00';
        lift.time_flexibility = '1h';

        var origin = new Origin();
        origin.city = coord.f;
        origin.coord = [coord.flng, coord.flat];

        var dest = new Destination();
        dest.city = coord.t;
        dest.coord = [coord.tlng, coord.tlat];

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
        var coord = {f:'a', flng:1, flat:2, t:'b', tlng:8, tlat:9};
        insertAndLoad(coord, function (lift) {
            console.log('Created lift: ', lift);

            lift.date.should.equal('05/05/2012');
            lift.time.should.equal('10:00');
            lift.time_flexibility.should.equal('1h');
            lift.from.city.should.equal("a");
            lift.from.coord[0].should.equal(1);
            lift.from.coord[1].should.equal(2);
            lift.to.city.should.equal("b");
            lift.to.coord[0].should.equal(8);
            lift.to.coord[1].should.equal(9);

            done();
        })
    })

    it('should update', function (done) {
        var coord = {f:'a', flng:1, flat:2, t:'b', tlng:8, tlat:9};
        insertAndLoad(coord, function (lift) {
            var liftUpdate = lift;
            liftUpdate.date =  '01/01/2013';

            var destUpdate = lift.to;

            var originUpdate = lift.from;
            originUpdate.city = 'Bucchianico, Italy';
            originUpdate.coord = [6, 7];

            liftUpdate.saveWith(originUpdate, destUpdate, function () {
                Lift.findOne({})
                        .populate('from')
                        .populate('to')
                        .run(function (err, res) {
                            if (err) throw done(err);

                            console.log('Updated lift: ', res);

                            res.date.should.equal('01/01/2013');
                            res.time.should.equal('10:00');
                            res.time_flexibility.should.equal('1h');
                            res.from.city.should.equal("Bucchianico, Italy");
                            res.from.coord[0].should.equal(6);
                            res.from.coord[1].should.equal(7);
                            res.to.city.should.equal("b");
                            res.to.coord[0].should.equal(8);
                            res.to.coord[1].should.equal(9);

                            done();
                        })
            })
        })
    })

    it('should remove', function (done) {
        var coord = {f:'a', flng:1, flat:2, t:'b', tlng:8, tlat:9};
        insertAndLoad(coord, function (lift) {
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
        var coord1 = {f:'from1', flng:14.18, flat:42.30, t:'to1', tlng:11.57, tlat:48.12};
        insertAndLoad(coord1, function (lift) {
            var coord2 = {f:'from2', flng:14.4, flat:42.9, t:'to2', tlng:11.8, tlat:48.45};
            insertAndLoad(coord2, function (lift) {

                //[lat, lng]
                var nearFrom = [14.2, 42.68];
                var nearTo = [11.77, 48.33];
                //distance 45km
                model.searchByDistance(nearFrom, nearTo, 45, function (lifts) {
                    lifts.should.have.length(2);

                    done();
                })

            })
        })

    })

})