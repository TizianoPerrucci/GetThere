$(document).ready(function () {

    configureMapAutocompletion('#lift-from', '#lift-from-coord');
    configureMapAutocompletion('#lift-to', '#lift-to-coord');

    configureDatepicker('#lift-date');
    configureClockpick('#lift-time');

    //////////

    function configureMapAutocompletion(elemId, coordId) {
        var options = {
            types:['(cities)']
        };

        $(elemId).each(function (index) {
            var autocomplete = new google.maps.places.Autocomplete(this, options);

            if ($(coordId).length > 0) {
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    var location = place.geometry.location;
                    $(coordId).val(location);
                });
            }
        });
    }

    function configureDatepicker(elemId) {
        if ($(elemId).length > 0) {
            $(elemId).datepicker();
            $(elemId).datepicker('setDate', new Date());
        }
    }

    function configureClockpick(elemId) {
        if ($(elemId).length > 0) {
            //http://archive.plugins.jquery.com/project/ClockPick
            $(elemId).clockpick({
                starthour : 0,
                endhour : 23,
                minutedivisions: 12,
                military : true,
                event: 'Focus',
                layout: 'Horizontal'
            });
        }
    }

});
