function defineModel(mongoose, fn) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    /**
     * Model: Lift
     */
    var Lift = new Schema({
        _id: ObjectId,
        date: String,
        time: String,
        time_flexibility: String,
        from: {type: ObjectId, ref: 'Origin'},
        to: {type: ObjectId, ref: 'Destination'}
    });
    var Origin = new Schema({
        //_lift: {type: ObjectId, ref: 'Lift'},
        city: String,
        city_coord: {lng: Number, lat: Number}
    });
    var Destination = new Schema({
        //_lift: {type: ObjectId, ref: 'Lift'},
        city: String,
        city_coord: {lng: Number, lat: Number}
    });

    Origin.index({city_coord:'2d'});
    Destination.index({city_coord:'2d'});

    Lift.statics.saveAll = function saveAll(lift, origin, dest) {
        origin.save(function (err) {
            if (err) throw err;

            dest.save(function (err) {
                if (err) throw err;

                lift.from = origin
                lift.to = dest
                lift.save(function (err) {
                    if (err) throw err;

                    console.log('Lift created: ' + lift);
                })
            })
        })
    };

    mongoose.model('Lift', Lift);
    mongoose.model('Origin', Origin);
    mongoose.model('Destination', Destination);

    fn();
}

exports.defineModel = defineModel;