//// Environment settings
//process.env.NODE_ENV = 'test';
//process.env.PORT = 3000;
//
//var app = require('../app');
//var model = require('../routes/model');
//var tobi = require('tobi'),
//        browser = tobi.createBrowser(parseInt(process.env.PORT), 'localhost');
//
//// browser = tobi.createBrowser(app); //TODO doesn't seem to work with tobi 0.3.2, express 2.5.8, node 0.6.14
//
//describe('Lift model', function () {
//
//    var Lift = model.lift();
//    var Origin = model.origin();
//    var Destination = model.destination();
//
//    beforeEach(function (done) {
//        Origin.remove({}, function() {
//            Destination.remove({}, function() {
//                Lift.remove({}, function() {
//                    done();
//                })
//            })
//        })
//    })
//
//
//    it('should create lift', function (done) {
//        browser.get('/lifts/new', function (res, $) {
//            console.log('got new form');
//
//            $('form').should.have.length(1);
//
//            $('#form-lift').fill({
//                'lift[from]':'berlin',
//                'lift[to]':'leipzig',
//                'lift[date]':'05/05/2012',
//                'lift[time]':'10:00',
//                'lift[time_flexibility]':'1h'
//            }).submit(function (res, $) {
//                console.log('form submitted');
//
//                //follows redirect!
//                res.should.have.status(200);
//                //$('ul').should.have.many('li');
//
//                $('li').should.have.length(1);
//                console.log('found 1 lift');
//
//                done();
//            });
//        });
//    });
//
//
//});
//