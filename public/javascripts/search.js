$(document).ready(function () {

    var form = $('#search-lift');
    if (form.length > 0) {

        form.submit(function (event) {
            event.preventDefault();

            var from_lng = $('#lift-from-lng').val();
            var from_lat = $('#lift-from-lat').val();
            var to_lng = $('#lift-to-lng').val();
            var to_lat = $('#lift-to-lat').val();
            var date = $('#lift-date').val();
            console.log('search lifts: (' + from_lat + ',' + from_lng + '), (' + to_lat + ',' + to_lng + '), ' + date);

            now.searchLift(from_lat, from_lng, to_lat, to_lng, date);
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
            $.each(directions, function(index, direction) { direction.setMap(null) });
            directions = [];

            $('#search-result').append("<lu>");
            $.each(lifts, function (index, lift) {
                $('#search-result').append('<li>' + lift.from.city + ', ' + lift.to.city + ', ' + lift.date + ', ' +
                        lift.time + ', ' + lift.time_flexibility + '</li>');

                var o = new google.maps.LatLng(lift.from.coord.lat, lift.from.coord.lng);
                var d = new google.maps.LatLng(lift.to.coord.lat, lift.to.coord.lng);
                var request = {
                    origin:o,
                    destination:d,
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