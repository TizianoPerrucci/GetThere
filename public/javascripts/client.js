$(document).ready(function () {

    var options = {
        types:['(cities)']
    };

    $('#lift-from').each(function (index) {
        var autocomplete = new google.maps.places.Autocomplete(this, options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            var location = place.geometry.location;
            $('#lift-from-coord').val(location);
        });
    });

    $('#lift-to').each(function (index) {
        var autocomplete = new google.maps.places.Autocomplete(this, options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            var location = place.geometry.location;
            $('#lift-to-coord').val(location);
        });
    });


});
