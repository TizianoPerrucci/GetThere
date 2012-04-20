function defineModel(mongoose, fn) {
    var deferred = require('deferred');

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    /**
     * Model: Lift
     */
    var Lift = new Schema({
        _id: ObjectId,
        from: String,
        from_coord: {lng: Number, lat: Number},
        to: String,
        to_coord: {lng: Number, lat: Number},
        date: String,
        time: String,
        time_flexibility: String
    });

    Lift.index({from_coord: '2d'});
    Lift.index({to_coord: '2d'});

    Lift.methods.promiseSave = function () {
        var d = deferred();
        d.resolve(this.save(arguments));
        return d.promise;
    };

    Lift.statics.promise = function (query) {
        //return deferred(query.run().addBack(function(r){this.apply(r)}));

        var d = deferred();
        d.resolve(query.run());
        return d.promise;
    };


    mongoose.model('Lift', Lift);

    fn();
}

exports.defineModel = defineModel;

