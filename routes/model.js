var mongoose = require('mongoose');

module.exports = {
    initialize: function(config) {
        var dbUri = config.mongo.dbUri;
        mongoose.connect(dbUri, function (err) {
            if (err) throw err;
            console.log('Mongo connected, uri: ' + dbUri);
        });

        var Schema = mongoose.Schema;
        var ObjectId = Schema.ObjectId;

        /**
         * MongoDB limit: can't have 2 special fields, code 13033
         *
         * You may only have 1 geospatial index per collection, for now.
         * While MongoDB may allow to create multiple indexes, this behavior is unsupported.
         * Because MongoDB can only use one index to support a single query, in most cases,
         * having multiple geo indexes will produce undesirable behavior.
         **/
        var Lift = new Schema({
            date: String,
            time: String,
            time_flexibility: String,
            from: {type: ObjectId, ref: 'Origin'},
            to: {type: ObjectId, ref: 'Destination'}
        });
        var Origin = new Schema({
            //_lift: {type: ObjectId, ref: 'Lift'},
            city: String,
            coord: {lng: Number, lat: Number}
        });
        var Destination = new Schema({
            //_lift: {type: ObjectId, ref: 'Lift'},
            city: String,
            coord: {lng: Number, lat: Number}
        });

        Origin.index({coord:'2d'});
        Destination.index({coord:'2d'});

        /*
        liftSchema.pre('save', function(next) {
            var self = this;
            var origin = self.from;
            var dest = self.to;
            origin.save(function (err) {
                if (err) throw err;

                dest.save(function (err) {
                    if (err) throw err;

                    self.from = origin;
                    self.to = dest;
                    self.save(function (err) {
                        if (err) throw err;
                        next();
                    })
                });
            });
        })
        */

        Lift.methods.saveWith = function(origin, dest, callback) {
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

        Lift.methods.removeAll = function(callback) {
            var self = this;
            var origin = self.from;
            var dest = self.to;
            origin.remove(function(err){
                if (err) throw err;

                dest.remove(function(err){
                    if (err) throw err;

                    self.remove(function(err){
                        if (err) throw err;

                        callback();
                    })
                })
            })
        };

        mongoose.model('Lift', Lift);
        mongoose.model('Origin', Origin);
        mongoose.model('Destination', Destination);
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

    searchByDistance: function(from, to, distance, callback) {
        console.log('search by distance: ', from , to);

        //find origins and get list objectIds
        //find destinations and get list objectIds
        //search lifts that have valid origins and destinations
        var Origin = this.origin();
        var Destination = this.destination();
        var Lift = this.lift();

        Origin.find({'coord': { $near : from, $maxDistance: distance }}, function(err, origins) {
            if (err) throw err;

            Destination.find({'coord': { $near : to, $maxDistance: distance }}, function(err, dests) {
                if (err) throw err;

                Lift.find({'from': {$in: origins}, 'to': {$in: dests} })
                        .populate('from')
                        .populate('to')
                        .run(function (err, lifts) {
                            if (err) throw done(err);

                            callback(lifts);
                        })
            })
        })
    }
    
};