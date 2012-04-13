
function defineModel(mongoose, fn) {
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

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

    mongoose.model('Lift', Lift);

    fn();
}

exports.defineModel = defineModel;

