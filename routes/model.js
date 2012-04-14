function defineModel(mongoose, fn) {
    var deferred = require('deferred');

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    /**
     * Model: Lift
     */
    var Lift = new Schema({
        '_id': ObjectId,
        'from': { type:String, index:true },
        'from_coord': String,
        'to': String,
        'to_coord': String,
        'date': String,
        'time': String,
        'time_flexibility': String
    });

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

