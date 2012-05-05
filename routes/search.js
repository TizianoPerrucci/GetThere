var model = require('../routes/model');
var nowjs = require("now");

module.exports = function(app) {
    //on heroku websocket doesn't work
    var everyone = nowjs.initialize(app, {clientWrite:true, socketio:{'log level':2, transports:['xhr-polling', 'jsonp-polling']}});

    everyone.now.searchLift = function (from_lat, from_lng, to_lat, to_lng, date, tolerance) {
        //on the client Google Map uses (lat, lng) order
        var self = this;

        //TODO some validation

        //MongoDB uses as order [lng, lat]
        model.searchByDistance([+from_lng, +from_lat], [+to_lng, +to_lat], tolerance, function(lifts) {
            console.log('Search lifts: ' + lifts);
            //answer to client
            self.now.showSearchResult(lifts);
        });
    };
};