$(document).ready(function () {
    var map;

    var form = $('#search-lift');
    if (form.length > 0) {

        form.submit(function (event) {
            event.preventDefault();

            var from_lat = parseFloat($('#search-from-lat').val());
            var from_lng = parseFloat($('#search-from-lng').val());
            var to_lat = parseFloat($('#search-to-lat').val());
            var to_lng = parseFloat($('#search-to-lng').val());
            var date = $('#search-date').val();
            var tolerance = parseFloat($('#search-tolerance').val());
            console.log('search lifts: (' + from_lat + ',' + from_lng + '), (' + to_lat + ',' + to_lng + '), ' + date + ', ' + tolerance);

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
            console.log('map bounds: ',southWest, northEast);

            map.fitBounds(new google.maps.LatLngBounds(southWest, northEast));

            now.searchLift(from_lat, from_lng, to_lat, to_lng, date, tolerance);
        });

        var bucchianico = new google.maps.LatLng(42.3058632, 14.182741999999962);
        var opt = {
            zoom:4,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            center:bucchianico,
            disableDefaultUI:true,
            zoomControl: true
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), opt);

        //TODO create distance control as jquery slider
        var homeControlDiv = document.createElement('div');
        var homeControl = new HomeControl(homeControlDiv, map);
        homeControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(homeControlDiv);


        var directionsService = new google.maps.DirectionsService();
        var directions = [];

        now.showSearchResult = function (lifts) {
            //reset
            $('#search-result').html('');
            $.each(directions, function(index, direction) { direction.setMap(null) });
            directions = [];

            $('#search-result').append("<lu>");
            $.each(lifts, function (index, lift) {
                var liftDescription = lift.from.city + ',\n' + lift.to.city + ',\n' + lift.date + ', ' + lift.time + ', ' + lift.time_flexibility;
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
                    preserveViewport:true,
                    polylineOptions:{
                        strokeColor:random_color('hex')
                    },
                    markerOptions: {
                        title:liftDescription
                    },
                    //infoWindow: new google.maps.InfoWindow({
                    //    content:'info info info'
                    //})
                    suppressInfoWindows:true
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

        function HomeControl(controlDiv, map) {
          // Set CSS styles for the DIV containing the control
          // Setting padding to 5 px will offset the control
          // from the edge of the map.
          controlDiv.style.padding = '5px';

          // Set CSS for the control border.
          var controlUI = document.createElement('div');
          controlUI.style.backgroundColor = 'white';
          controlUI.style.borderStyle = 'solid';
          controlUI.style.borderWidth = '2px';
          controlUI.style.cursor = 'pointer';
          controlUI.style.textAlign = 'center';
          controlUI.title = 'Click to set the map to Home';
          controlDiv.appendChild(controlUI);

          // Set CSS for the control interior.
          var controlText = document.createElement('div');
          controlText.style.fontFamily = 'Arial,sans-serif';
          controlText.style.fontSize = '12px';
          controlText.style.paddingLeft = '4px';
          controlText.style.paddingRight = '4px';
          controlText.innerHTML = '<strong>Home<strong>';
          controlUI.appendChild(controlText);

          // Setup the click event listeners: simply set the map to Chicago.
          google.maps.event.addDomListener(controlUI, 'click', function() {
            map.setCenter(bucchianico)
          });
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