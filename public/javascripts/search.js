$(document).ready(function () {

    var form = $('#search-lift');
    if (form.length > 0) {

        form.submit(function (event) {
            event.preventDefault();

            var from = $('#lift-from').val();
            var to = $('#lift-to').val();
            var date = $('#lift-date').val();
            console.log('fire search with: ' + from + ' ,' + to + ' ,' + date);

            now.searchLift(from, to, date);
        });

        var bucchianico = new google.maps.LatLng(42.3058632, 14.182741999999962);
        var opt = {
            zoom:3,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            center:bucchianico,
            disableDefaultUI:true
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), opt);

        var directionsService = new google.maps.DirectionsService();
        var directions = [];

        now.showSearchResult = function (lifts) {
            //reset
            $('#search-result').html('');
            $.each(directions, function(index, direction) {
                direction.setMap(null);
            });
            directions = [];

            $('#search-result').append("<lu>");
            $.each(lifts, function (index, lift) {
                $('#search-result').append('<li>' + lift.from + ', ' + lift.to + ', ' + lift.date + ', ' +
                        lift.time + ', ' + lift.time_flexibility + '</li>');

                var request = {
                    origin:lift.from_coord,
                    destination:lift.to_coord,
                    travelMode:google.maps.TravelMode.DRIVING
                };

                var directionsRenderer = new google.maps.DirectionsRenderer();
                directions[index] = directionsRenderer;
                directionsRenderer.setMap(map);
                directionsRenderer.setOptions({preserveViewport:true});

                directionsService.route(request, function (result, status) {
                    console.log("route status:" + status);
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsRenderer.setDirections(result);
                    }
                });
            });
            $('#search-result').append("</lu>");

        };
    }

});