$(document).ready(function () {
    var map;

    var form = $('#search-lift');
    if (form.length > 0) {

        var bucchianico = new google.maps.LatLng(42.3058632, 14.182741999999962);
        var opt = {
            zoom:4,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            center:bucchianico,
            disableDefaultUI:true,
            zoomControl: true
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), opt);

        //TODO default values??
        configureToleranceControl(map, 250, 500);

        var from, to;
        var fromCircle, toCircle;
        var directionsService = new google.maps.DirectionsService();
        var directions = [];


        form.submit(function (event) {
            event.preventDefault();

            var from_lat = parseFloat($('#search-from-lat').val());
            var from_lng = parseFloat($('#search-from-lng').val());
            var to_lat = parseFloat($('#search-to-lat').val());
            var to_lng = parseFloat($('#search-to-lng').val());
            var date = $('#search-date').val();
            var tolerance = parseFloat($('#search-tolerance').val());
            console.log('search lifts: (' + from_lat + ',' + from_lng + '), (' + to_lat + ',' + to_lng + '), ' + date + ', ' + tolerance);

            function isValidCoord(c) {
                return c >= -180 && c < 180;
            }

            var doSearch = false;
            if (isValidCoord(from_lat) && isValidCoord(from_lng) && isValidCoord(to_lat) && isValidCoord(to_lng) &&
                    date && date.length > 0 && tolerance >= 0) {
                doSearch = true
            } else {
                alert("WARNING: Some inputs are not valid");
            }

            if (doSearch) {
                var southLat;
                var northLat;
                if (from_lat < to_lat) {
                    southLat = from_lat;
                    northLat = to_lat;
                } else {
                    southLat = to_lat;
                    northLat = from_lat;
                }
                var westLng;
                var eastLng;
                if (from_lng < to_lng) {
                    westLng = from_lng;
                    eastLng = to_lng;
                } else {
                    westLng = to_lng;
                    eastLng = from_lng;
                }

                var southWest = new google.maps.LatLng(southLat - tolerance, westLng - tolerance);
                var northEast = new google.maps.LatLng(northLat + tolerance, eastLng + tolerance);
                console.log('map bounds: ', southWest, northEast);

                //TODO not change it if not needed
                map.fitBounds(new google.maps.LatLngBounds(southWest, northEast));

                //reset search input
                if (from) from.setMap(null);
                if (fromCircle) fromCircle.setMap(null);
                if (to) to.setMap(null);
                if (toCircle) toCircle.setMap(null);

                var fromPosition = new google.maps.LatLng(from_lat, from_lng);
                var toPosition = new google.maps.LatLng(to_lat, to_lng);
                var radius = fromDegreeToMeters(tolerance);

                from = new google.maps.Marker({
                    position: fromPosition,
                    map: map,
                    title: 'From'
                });
                fromCircle = new google.maps.Circle({
                    center: fromPosition,
                    clickable: false,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map: map,
                    radius: radius,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });
                to = new google.maps.Marker({
                    position: toPosition,
                    map: map,
                    title: 'To'
                });
                toCircle = new google.maps.Circle({
                    center: toPosition,
                    clickable: false,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map: map,
                    radius: radius,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });

                now.searchLift(from_lat, from_lng, to_lat, to_lng, date, tolerance);
            }
        });


        now.showSearchResult = function (lifts) {
            //reset search result
            $('#search-result').html('');
            $.each(directions, function(index, direction) { direction.setMap(null) });
            directions = [];

            //print and plot results
            $('#search-result').append("<lu>");
            $.each(lifts, function (index, lift) {
                var liftDescription = lift.from.city + ', ' + lift.to.city + ', ' + lift.date + ', ' + lift.time + ', ' + lift.time_flexibility;
                $('#search-result').append('<li>' + liftDescription + '</li>');

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
                directionsRenderer.setOptions({
                    preserveViewport: true,
                    polylineOptions: {
                        strokeColor: random_color('hex')
                    },
                    markerOptions: {
                        title: lift.from.city + ' - ' + lift.to.city
                    },
                    suppressInfoWindows: true
                });

                directionsService.route(request, function (result, status) {
                    //console.log("route status:" + status);
                    if (status === google.maps.DirectionsStatus.OK) {
                       directionsRenderer.setDirections(result);
                    }
                });
            });
            $('#search-result').append("</lu>");

        };

        function configureToleranceControl(map, toleranceDefault, toleranceMax) {
            var controlDiv = $('<div></div>').get(0);
            controlDiv.index = 1;
            controlDiv.style.padding = '5px';

            var slider = $('<div style="width: 200px"></div>');
            slider.slider({
                max:toleranceMax,
                value:toleranceDefault,
                slide: function( event, ui ) {
                    $('#tolerance').val('Lifts at ' + ui.value + 'Km');
                    $('#search-tolerance').val(fromKmToDegree(ui.value));
                    form.submit();
                }
            });
            controlDiv.appendChild(slider.get(0));

            var tolerance = $('<input type="text" id="tolerance" />');
            tolerance.val('Lifts at ' + toleranceDefault + 'Km');
            $('#search-tolerance').val(fromKmToDegree(toleranceDefault));
            controlDiv.appendChild(tolerance.get(0));

            map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);
        }

        //TODO the world is not flat, use radiant instead
        /**
         * The current implementation assumes an idealized model of a flat earth,
         * meaning that an arcdegree of latitude (y) and longitude (x) represent the same distance everywhere.
         * This is only true at the equator where they are both about equal to 69 miles or 111km.
         */
        function fromKmToDegree(km) {
            return km / 111.128;
        }

        function fromDegreeToMeters(degree) {
            return (degree * 111.128) * 1000;
        }


        function random_color(format) {
            var rint = Math.round(0xffffff * Math.random());
            switch(format) {
                case 'hex':
                    return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
                    break;
                case 'rgb':
                    return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';
                    break;
                default:
                    return rint;
                    break;
            }
        }
    }

});