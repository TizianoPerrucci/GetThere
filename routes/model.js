var initialized = false;

var mongoose = require('mongoose');

module.exports = {
    initialize: function(config) {
        if (!initialized) {
            initialized = true;
            console.log('config: ', config);

            var dbUri = config.mongo.dbUri;
            mongoose.connect(dbUri, function (err) {
                if (err) throw err;
                console.log('Mongo connected, uri: ' + dbUri);
            });

            var Schema = mongoose.Schema;
            var ObjectId = Schema.ObjectId;

            /**
             * http://www.mongodb.org/display/DOCS/Geospatial+Indexing
             *
             * --> To make sure coordinate ordering is preserved from all languages use a 2 element array.
             *
             * --> MongoDB limit: can't have 2 special fields, code 13033
             *
             * You may only have 1 geospatial index per collection, for now.
             * While MongoDB may allow to create multiple indexes, this behavior is unsupported.
             * Because MongoDB can only use one index to support a single query, in most cases,
             * having multiple geo indexes will produce undesirable behavior.
             *
             **/
            var Lift = new Schema({
                date:String,
                time:String,
                time_flexibility:String,
                from:{type:ObjectId, ref:'Origin'},
                to:{type:ObjectId, ref:'Destination'}
            });
            var Origin = new Schema({
                //_lift: {type: ObjectId, ref: 'Lift'},
                city:String,
                coord: [Number, Number] //use array to force mongoose to keep order [lng, lat]
            });
            var Destination = new Schema({
                //_lift: {type: ObjectId, ref: 'Lift'},
                city:String,
                coord: [Number, Number] //use array to force mongoose to keep order [lng, lat]
            });

            Origin.index({coord:'2d'});
            Destination.index({coord:'2d'});

            Lift.methods.saveWith = function (origin, dest, callback) {
                var self = this;
                origin.save(function (err) {
                    if (err) throw err;

                    dest.save(function (err) {
                        if (err) throw err;

                        self.from = origin;
                        self.to = dest;
                        self.save(function (err) {
                            if (err) throw err;
                            callback(self);
                        })
                    });
                });
            };

            Lift.methods.removeAll = function (callback) {
                var self = this;
                var origin = self.from;
                var dest = self.to;
                origin.remove(function (err) {
                    if (err) throw err;

                    dest.remove(function (err) {
                        if (err) throw err;

                        self.remove(function (err) {
                            if (err) throw err;

                            callback();
                        })
                    })
                })
            };

            mongoose.model('Lift', Lift);
            mongoose.model('Origin', Origin);
            mongoose.model('Destination', Destination);
        }
    },

    lift: function() {
        return mongoose.model('Lift');
    },

    origin: function() {
        return mongoose.model('Origin');
    },

    destination: function() {
        return mongoose.model('Destination');
    },

    searchByDistance: function(from, to, fromKmRange, toKmRange, callback) {
        console.log('search by distance: ', from , to, fromKmRange, toKmRange);

        //find origins and get list objectIds
        //find destinations and get list objectIds
        //search lifts that have valid origins and destinations
        var Origin = this.origin();
        var Destination = this.destination();
        var Lift = this.lift();

        /**
         * http://www.mongodb.org/display/DOCS/Geospatial+Indexing#GeospatialIndexing-TheEarthisRoundbutMapsareFlat
         *
         * Spherical distances can be used by adding "Sphere" to the name of the query
         */
        var earthRadius = 6371; // km
        var fromRange = fromKmRange / earthRadius; // to radians
        var toRange = toKmRange / earthRadius; // to radians

        Origin.find({'coord': { $nearSphere : from, $maxDistance: fromRange }}, function(err, origins) {
            if (err) throw err;

            Destination.find({'coord': { $nearSphere : to, $maxDistance: toRange }}, function(err, dests) {
                if (err) throw err;

                Lift.find({'from': {$in: origins}, 'to': {$in: dests} })
                        .populate('from')
                        .populate('to')
                        .run(function (err, lifts) {
                            if (err) throw err;

                            callback(lifts);
                        })
            })
        })
    }
    
};