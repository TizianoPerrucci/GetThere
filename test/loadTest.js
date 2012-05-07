// Environment settings
process.env.NODE_ENV = 'test';
//process.env.NODE_ENV = 'development';
//process.env.NODE_ENV = 'production';

var should = require('should');

var konphyg = require('konphyg')(__dirname + '/../config');
var config = konphyg('conf');

//TODO initialize only once
var model = require('../routes/model');
model.initialize(config);


describe('Lift bulk load', function () {

    var ObjectId = require('mongoose').Types.ObjectId;

    var Lift = model.lift();
    var Origin = model.origin();
    var Destination = model.destination();

    beforeEach(function(done) {
        Origin.remove({}, function () {
            Destination.remove({}, function () {
                Lift.remove({}, function () {
                    var froms = [
                        {'_id': ObjectId.fromString('100000000000000000000001'),
                            'city' : 'Fiumicino, Italy', 'coord' : [ 12.230001799999968, 41.7715285 ] },
                        {'_id': ObjectId.fromString('100000000000000000000002'),
                            'city' : 'Rome, Italy', 'coord' : [ 12.494248599999992, 41.8905198 ] },
                        {'_id': ObjectId.fromString('100000000000000000000003'),
                            'city' : 'Ciampino, Italy', 'coord' : [ 12.602136200000018, 41.8025436 ] }
                    ];

                    var tos = [
                        {'_id': ObjectId.fromString('200000000000000000000001'),
                            'city' : 'Bucchianico, Italy', 'coord' : [ 14.182741999999962, 42.3058632 ] },
                        {'_id': ObjectId.fromString('200000000000000000000002'),
                            'city' : 'Bucchianico, Italy', 'coord' : [ 14.182741999999962, 42.3058632 ] },
                        {'_id': ObjectId.fromString('200000000000000000000003'),
                            'city' : 'Bucchianico, Italy', 'coord' : [ 14.182741999999962, 42.3058632 ] }
                    ]

                    var lifts = [
                        {'_id': ObjectId.fromString('300000000000000000000001'),
                            'date': new Date(2012, 4, 5, 9, 0, 0), time_flexibility: '1h',
                            'from': ObjectId.fromString('100000000000000000000001'), 'to': ObjectId.fromString('200000000000000000000001')},
                        {'_id': ObjectId.fromString('300000000000000000000002'),
                            'date': new Date(2012,4,5,9,0,0), time_flexibility: '1h',
                            'from': ObjectId.fromString('100000000000000000000002'), 'to': ObjectId.fromString('200000000000000000000002')},
                        {'_id': ObjectId.fromString('300000000000000000000003'),
                            'date': new Date(2012,4,5,9,0,0), time_flexibility: '1h',
                            'from': ObjectId.fromString('100000000000000000000003'), 'to': ObjectId.fromString('200000000000000000000003')}
                    ]

                    //bulk load
                    Origin.collection.insert(froms, function() {
                        Destination.collection.insert(tos, function() {
                            Lift.collection.insert(lifts, done);
                        })
                    })
                })
            })
        })
    })

    it('should have loaded', function(done) {
        Lift.find({}).populate('from').populate('to').run(function (err, lifts) {
            if (err) throw done(err);
            console.log('Listing lifts: ' + lifts);
            lifts.should.have.length(3);
            done();
        });
    })

})