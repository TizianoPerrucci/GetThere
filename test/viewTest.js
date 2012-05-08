// Environment settings
process.env.NODE_ENV = 'test';
process.env.PORT = 3000;

var app = require('../app');
var tobi = require('tobi'),
        browser = tobi.createBrowser(parseInt(process.env.PORT), 'localhost');

// browser = tobi.createBrowser(app); //TODO doesn't seem to work with tobi 0.3.2, express 2.5.8, node 0.6.14

var konphyg = require('konphyg')(__dirname + '/../config');
var config = konphyg('conf');

//TODO initialize only once
var model = require('../routes/model');
model.initialize(config);

describe('Lift view', function () {

    var Lift = model.lift();
    var Origin = model.origin();
    var Destination = model.destination();

    beforeEach(function (done) {
        Origin.remove({}, function() {
            Destination.remove({}, function() {
                Lift.remove({}, done)
            })
        })
    })


    it('should create lift', function (done) {
        browser.get('/lifts/new', function (res, $) {
            console.log('got new form');

            $('form').should.have.length(1);

            $('#form-lift').fill({
                'lift[from]':'berlin',
                'lift[from_lng]':'1',
                'lift[from_lat]':'2',
                'lift[to]':'leipzig',
                'lift[to_lng]':'8',
                'lift[to_lat]':'9',
                'lift[date]':'05/05/2012',
                'lift[time]':'10:00',
                'lift[time_flexibility]':'1h'
            }).submit(function (res, $) {
                        console.log('form submitted');

                        //follows redirect!
                        res.should.have.status(200);

                        //$('ul').should.have.many('li');

                        $('li').should.have.length(1);
                        //TODO check lift elements
                        console.log('found 1 lift');

                        done();
                    });
        });
    });

    //TODO test
    it('search should result in lifts');


});

