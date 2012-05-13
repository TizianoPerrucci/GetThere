var nowjs = require("now");

module.exports = function(app, model) {
    //on heroku websocket doesn't work
    var everyone = nowjs.initialize(app, {clientWrite:true, socketio:{'log level':1, transports:['xhr-polling', 'jsonp-polling']}});
    everyone.now.searchLift = function(options) {
        var self = this;

        //TODO validation

        //MongoDB uses a different order [lng, lat] then Goggle map [lat, lng]
        var from = [+options.fromLng, +options.fromLat];
        var to = [+options.toLng, +options.toLat];
        model.searchByDistanceAndDate(from, options.fromTol, to, options.toTol, options.date, options.dateTol,
                function(lifts) {
                    console.log('Search lifts: ' + lifts);
                    //answer to client
                    self.now.showSearchResult(lifts);
                });
    };
};