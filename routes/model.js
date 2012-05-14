var initialized = false;

var mongoose = require('mongoose');
var moment = require('moment');
var everyauth = require('everyauth');
var mongooseAuth = require('mongoose-auth');

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
             * --> To make sure coordinate ordering is preserved from all languages use a 2 element array [lng, lat].
             *
             * --> MongoDB limit: can't have 2 special fields, code 13033
             *
             * You may only have 1 geospatial index per collection, for now.
             * While MongoDB may allow to create multiple indexes, this behavior is unsupported.
             * Because MongoDB can only use one index to support a single query, in most cases,
             * having multiple geo indexes will produce undesirable behavior.
             *
             **/
            var LiftSchema = new Schema({
                date: {type: Date, index: true},
                time_flexibility: String,
                from: {type:ObjectId, ref:'Origin'},
                to: {type:ObjectId, ref:'Destination'}
            });
            var OriginSchema = new Schema({
                //_lift: {type: ObjectId, ref: 'Lift'},
                city: String,
                coord: [Number, Number] //use array to force mongoose to keep order [lng, lat]
            });
            var DestinationSchema = new Schema({
                //_lift: {type: ObjectId, ref: 'Lift'},
                city: String,
                coord: [Number, Number] //use array to force mongoose to keep order [lng, lat]
            });

            OriginSchema.index({coord: '2d'});
            DestinationSchema.index({coord: '2d'});

            LiftSchema.methods.saveWith = function (origin, dest, callback) {
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

            LiftSchema.methods.removeAll = function (callback) {
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

            mongoose.model('Lift', LiftSchema);
            mongoose.model('Origin', OriginSchema);
            mongoose.model('Destination', DestinationSchema);

            //

            var UserSchema = new Schema({});
            var User;

            //everyauth.debug = true;

            UserSchema.plugin(mongooseAuth, {
                // Here, we attach your User model to every module
                everymodule: {
                    everyauth: {
                        User: function () {
                            return User;
                        }
                    }
                }
                , google: {
                    everyauth: {
                        myHostname: 'http://dev.getthere.com:8080'
                        , appId: config.google.clientId
                        , appSecret: config.google.clientSecret
                        , scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
                        , redirectPath: '/lifts'
                        //, findOrCreateUser: function (sess, accessTok, accessTokExtra, googleUser) {
                        //    console.log('user', googleUser);
                        //}
                    }
                }
                , twitter: {
                    everyauth: {
                        myHostname: 'http://dev.getthere.com:8080'
                        , consumerKey: config.twitter.consumerKey
                        , consumerSecret: config.twitter.consumerSecret
                        , redirectPath: '/lifts'
                    }
                }
                , github: {
                    everyauth: {
                        myHostname: 'http://dev.getthere.com:8080'
                        , appId: config.github.clientId
                        , appSecret: config.github.secret
                        , redirectPath: '/lifts'
                    }
                }

                , password: {
                    loginWith: 'email'
                    , extraParams: {
                        phone: String
                        , name: {
                            first: String
                            , last: String
                        }
                    }
                    , everyauth: {
                        getLoginPath: '/login'
                        , postLoginPath: '/login'
                        , loginView: 'login.jade'
                        , getRegisterPath: '/register'
                        , postRegisterPath: '/register'
                        , registerView: 'register.jade'
                        , loginSuccessRedirect: '/'
                        , registerSuccessRedirect: '/'
                    }
                }
            });

            //UserSchema.statics.createWithGoogleOAuth = function(googleUser, accessToken, accessTokenExtra, callback) {
            //    console.log(googleUser);
            //};

            UserSchema.statics.createWithGithub = function (ghUser, accessToken, callback) {
                //TODO email should be valid

                var params = {
                    github: {
                        id: ghUser.id
                        , type: ghUser.type
                        , login: ghUser.login
                        , gravatarId: ghUser.gravatar_id
                        , name: ghUser.name
                        , email: ghUser.email
                        , location: ghUser.location
                        , permission: ghUser.permission
                        , createdAt: ghUser.created_at
                    }
                };

                // We do this if password module is enabled
                params[everyauth.password.loginKey()] = "github:" + ghUser.id; // Hack because of way mongodb treate unique indexes

                this.create(params, callback);
            };

            User = mongoose.model('User', UserSchema);
            console.log('Model Initialized.');
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

    searchByDistanceAndDate: function(from, fromKmRange, to, toKmRange, date, dayRange, callback) {
        console.log('search by distance: ', from , fromKmRange, to, toKmRange, date, dayRange);

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

                var lowerBoundDate = moment(date.valueOf()).subtract('days', dayRange).toDate();
                var upperBoundDate = moment(date.valueOf()).add('days', dayRange).toDate();

                //includes date boundaries
                Lift.find({'from': {$in: origins}, 'to': {$in: dests}, 'date': {$gte: lowerBoundDate, $lte: upperBoundDate} })
                        .populate('from')
                        .populate('to')
                        .run(function (err, lifts) {
                            if (err) throw err;

                            callback(lifts);
                        })
            })
        })
    },

    user: function() {
        return mongoose.model('User');
    }
    
};