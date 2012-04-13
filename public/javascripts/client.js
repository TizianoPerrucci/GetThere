$(document).ready(function () {

    configureMapAutocompletion('#lift-from', '#lift-from-coord');
    configureMapAutocompletion('#lift-to', '#lift-to-coord');

    configureDatepicker('#lift-date');

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
        }
    }

});
