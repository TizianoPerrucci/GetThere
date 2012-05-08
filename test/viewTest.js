// Environment settings
process.env.NODE_ENV = 'test';
process.env.PORT = 3000;

var app = require('../app');
var tobi = require('tobi'),
        browser = tobi.createBrowser(parseInt(process.env.PORT), 'localhost', {external: true});

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

    function fillAndSubmit(info, callback) {
        browser.get('/lifts/new', function (res, $) {
            $('form').should.have.length(1);

            $('#form-lift').fill({
                'lift[from]':info.f,
                'lift[from_lng]':info.flng,
                'lift[from_lat]':info.flat,
                'lift[to]':info.t,
                'lift[to_lng]':info.tlng,
                'lift[to_lat]':info.tlat,
                'lift[date]':info.d,
                'lift[time]':info.time,
                'lift[time_flexibility]':info.tf
            }).submit(function (res, $) {
                        callback(res, $);
                    });
        });
    }

    it('should create lift', function (done) {
        var info = {f:'berlin', flng:1, flat:2, t:'leipzig', tlng:8, tlat:9, d:'5-5-2012', time:'10:00', tf:'1h'};
        fillAndSubmit(info, function(res, $) {
            //follows redirect!
            res.should.have.status(200);
            $('li').should.have.length(1);
            $('li').text().should.match(/^berlin, leipzig, 05\/05\/2012 10:00, 1h.*/);
            done();
        })
    })

    //it('search should result in lifts', function (done) {
    //    this.timeout(5 * 1000);
    //
    //    var info1 = {f:'aaa', flng:14.18, flat:42.30, t:'bbb', tlng:11.57, tlat:48.12, d:'5-4-2012', time:'10:00', tf:'1h'};
    //    fillAndSubmit(info1, function(res, $) {
    //        var info2 = {f:'ccc', flng:14.4, flat:42.9, t:'ddd', tlng:11.8, tlat:48.45, d:'5-6-2012', time:'10:00', tf:'1h'};
    //        fillAndSubmit(info2, function (lift) {
    //            browser.get('/search', function (res, $) {
    //                $('#search-lift').fill({
    //                    'search-from-lat':'14.2',
    //                    'search-from-lng':'42.68',
    //                    'search-from-tolerance':'45',
    //                    'search-to-lat':'11.77',
    //                    'search-to-lng':'48.33',
    //                    'search-to-tolerance':'45',
    //                    'search-date':'5-5-2012',
    //                    'search-date-tolerance':'1'
    //                });
    //
    //                console.log('search filled');
    //
    //                $('#search-lift').submit(function(){
    //                    console.log('submitted');
    //                    //TODO the submit doesn't invoke now ... ?
    //                });
    //
    //                setTimeout(function() {
    //                    $('li').should.have.length(2);
    //                    done();
    //                }, 3000);
    //            })
    //        })
    //    })
    //})

});