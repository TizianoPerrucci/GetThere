module.exports.configure = defineApp

function defineApp(app) {

    function Lift(where, when) {}

    var inMemoryData = new Array();


    app.get('/lifts', function (req, res) {
        res.render('./lifts/list', {lifts:inMemoryData});
    });

    app.get("/lifts/new", function (req, res) {
        res.render('./lifts/new', {lift:new Lift()});
    });

    app.get('/lifts/:id', function (req, res) {
        var id = req.params.id;
        res.render('./lifts/show', {lift:inMemoryData[id]});
    });

    app.get("/lifts/:id/edit", function (req, res) {
        var id = req.params.id;
        res.render('./lifts/edit', {lift:inMemoryData[id], id:id});
    });


    //Create lift
    app.post('/lifts', function (req, res) {
        var lift = req.body.lift;
        inMemoryData.push(lift);

        console.log('Received creation for lift: where ' + lift.where + ' - when ' + lift.when);

        res.redirect('/lifts');
    });

    //Update lift
    app.put('/lifts/:id', function (req, res) {
        var lift = req.body.lift;
        var id = req.params.id;
        inMemoryData[id] = lift;

        console.log('Received update for lift ' + id + ': where ' + lift.where + ' - when ' + lift.when);

        res.redirect('/lifts');
    });

    //Delete lift
    app.del('/lifts/:id', function (req, res) {
        var id = req.params.id;
        inMemoryData[id] = null;

        console.log('Received delete lift ' + id);

        res.redirect('/lifts');
    });

}