var model = require('../routes/model');
var nowjs = require("now");

module.exports = function(app) {
    //on heroku websocket doesn't work
    var everyone = nowjs.initialize(app, {clientWrite:true, socketio:{'log level':2, transports:['xhr-polling', 'jsonp-polling']}});

    everyone.now.searchLift = function (from_lat, from_lng, to_lat, to_lng, date) {
        var self = this;
        console.log('received query - from: (' + from_lat + ',' + from_lng + '), (' + to_lat + ',' + to_lng + ') ,date: ' + date);

        //[lat, lng]
        model.searchByDistance([+from_lat, +from_lng], [+to_lat, +to_lng], 5, function(lifts) {
            console.log('Search lifts: ' + lifts);
            //answer to client
            self.now.showSearchResult(lifts);
        });
    };
};