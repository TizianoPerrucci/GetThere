// Environment settings
process.env.NODE_ENV = 'test';

var should = require('should');
var moment = require('moment');

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
                Lift.remove({}, done)
            })
        })
    })

    function insertAndLoad(info, callback) {
        var lift = new Lift();
        lift.date = info.d;
        lift.time_flexibility = '1h';

        var origin = new Origin();
        origin.city = info.f;
        origin.coord = [info.flng, info.flat];

        var dest = new Destination();
        dest.city = info.t;
        dest.coord = [info.tlng, info.tlat];

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
        var date = moment('5-5-2012 10:00', 'MM-DD-YYYY HH:mm').toDate();
        var info = {f:'a', flng:1, flat:2, t:'b', tlng:8, tlat:9, d: date};
        insertAndLoad(info, function (lift) {
            console.log('Created lift: ', lift);

            lift.date.should.equal(date.valueOf());
            lift.time_flexibility.should.equal('1h');
            lift.from.city.should.equal("a");
            //requires strict order (lng,lat)
            lift.from.coord[0].should.equal(1);
            lift.from.coord[1].should.equal(2);
            lift.to.city.should.equal("b");
            lift.to.coord[0].should.equal(8);
            lift.to.coord[1].should.equal(9);

            done();
        })
    })

    it('should update', function (done) {
        var date = moment('5-5-2012 10:00', 'MM-DD-YYYY HH:mm').toDate();
        var info = {f:'a', flng:1, flat:2, t:'b', tlng:8, tlat:9, d: date};
        insertAndLoad(info, function (lift) {
            var liftUpdate = lift;
            var newDate = moment('10-10-2019 11:33', 'MM-DD-YYYY HH:mm').toDate();
            liftUpdate.date = newDate;

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

                            res.date.should.equal(newDate.valueOf());
                            res.time_flexibility.should.equal('1h');
                            res.from.city.should.equal("Bucchianico, Italy");
                            //requires strict order (lng,lat)
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
        var date = moment('5-5-2012 10:00', 'MM-DD-YYYY HH:mm').toDate();
        var info = {f:'a', flng:1, flat:2, t:'b', tlng:8, tlat:9, d: date};
        insertAndLoad(info, function (lift) {
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

    it('should search by distance and date', function (done) {
        var date1 = moment('5-4-2012 10:00', 'MM-DD-YYYY HH:mm').toDate();
        var info1 = {f:'from1', flng:14.18, flat:42.30, t:'to1', tlng:11.57, tlat:48.12, d: date1};
        insertAndLoad(info1, function (lift) {
            var date2 = moment('5-6-2012 10:00', 'MM-DD-YYYY HH:mm').toDate();
            var info2 = {f:'from2', flng:14.4, flat:42.9, t:'to2', tlng:11.8, tlat:48.45, d: date2};
            insertAndLoad(info2, function (lift) {

                //[lat, lng]
                var nearFrom = [14.2, 42.68];
                var nearTo = [11.77, 48.33];
                var distance = 45; //km
                var date = moment('5-5-2012 10:00', 'MM-DD-YYYY HH:mm').toDate();
                var dayRange = 1;
                model.searchByDistanceAndDate(nearFrom, distance, nearTo, distance, date, dayRange, function (lifts) {
                    lifts.should.have.length(2);

                    done();
                })

            })
        })
    })

})