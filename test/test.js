// Force test environment
process.env.NODE_ENV = 'test';

var app = require('../app'),
        tobi = require('tobi'),
        browser = tobi.createBrowser(8080, 'localhost');

// browser = tobi.createBrowser(app); //TODO doesn't seem to work with tobi 0.3.2, express 2.5.8, node 0.6.14


describe('Lift actions -', function () {

    beforeEach(function (done) {
        app.Lift.find({}, function (err, records) {
            if (err) return done(err);
            records.forEach(function (result) {
                result.remove();
            });
            done();
        });
    });

    it('should create lift', function (done) {
        browser.get('/lifts/new', function (res, $) {
            console.log('got new form');

            $('form').should.have.length(1);

            $('#new-lift').fill({
                'lift[from]':'berlin',
                'lift[to]':'leipzig',
                'lift[date]':'05/05/2012',
                'lift[time]':'10:00',
                'lift[time_flexibility]':'1h'
            }).submit(function (res, $) {
                console.log('form submitted');

                //follows redirect!

                res.should.have.status(200);
                $('ul').should.have.many('li');

                console.log('found many lifts');

                done();
            });
        });
    });

});

