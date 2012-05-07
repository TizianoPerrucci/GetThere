var model = require('../routes/model');
var nowjs = require("now");

module.exports = function(app) {
    //on heroku websocket doesn't work
    var everyone = nowjs.initialize(app, {clientWrite:true, socketio:{'log level':2, transports:['xhr-polling', 'jsonp-polling']}});

    everyone.now.searchLift = function (from_lat, from_lng, fromTolerance, to_lat, to_lng, toTolerance, date, dayRange) {
        //on the client Google Map uses (lat, lng) order
        var self = this;

        //TODO some validation

        //MongoDB uses as order [lng, lat]
        model.searchByDistanceAndDate([+from_lng, +from_lat], fromTolerance, [+to_lng, +to_lat], toTolerance, date, dayRange, function(lifts) {
            console.log('Search lifts: ' + lifts);
            //answer to client
            self.now.showSearchResult(lifts);
        });
    };
};