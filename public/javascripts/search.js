$(document).ready(function () {
    var map;

    var form = $('#search-lift');
    if (form.length > 0) {

        var bucchianico = new google.maps.LatLng(42.3058632, 14.182741999999962);
        var opt = {
            zoom:4,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            center:bucchianico,
            disableDefaultUI:true
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), opt);

        //TODO default values??
        configureToleranceControls(form, map, 10, 100);
        configureTimeRangeControl(form, map, 1, 30);

        var from, to;
        var fromCircle, toCircle;
        var directionsService = new google.maps.DirectionsService();
        var directions = [];

        $('.noEnterSubmit').keydown(function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                return false;
            }
        });


        form.submit(function (event) {
            event.preventDefault();

            var fromLat = parseFloat($('#search-from-lat').val());
            var fromLng = parseFloat($('#search-from-lng').val());
            var fromTolerance = parseFloat($('#search-from-tolerance').val());
            var toLat = parseFloat($('#search-to-lat').val());
            var toLng = parseFloat($('#search-to-lng').val());
            var toTolerance = parseFloat($('#search-to-tolerance').val());
            var date = $('#search-date').datepicker('getDate');
            var dateTolerance = parseInt($('#search-date-tolerance').val());
            console.log('search lifts: (' + fromLat + ',' + fromLng + '), ' + fromTolerance + ', (' + toLat + ',' + toLng + '), ' +
                    toTolerance + ', ' + date + ', ' + dateTolerance);

            function isValidCoord(c) {
                return c >= -180 && c < 180;
            }

            var doSearch = false;
            if (isValidCoord(fromLat) && isValidCoord(fromLng) && isValidCoord(toLat) && isValidCoord(toLng) &&
                    fromTolerance >= 0 && toTolerance >= 0 && date && dateTolerance >= 0) {
                doSearch = true
            } else {
                alert("WARNING: Some inputs are not valid");
            }

            if (doSearch) {
                var doSetBound = true;
                if (from && to) {
                    //if from and to didn't change from previous search don't set bounds again
                    var prevFrom = from.getPosition();
                    var prevTo = to.getPosition();
                    doSetBound = prevFrom.lat() != fromLat || prevFrom.lng() != fromLng || prevTo.lat() != toLat || prevTo.lng() != toLng;
                }

                if (doSetBound) {
                    var southLat;
                    var northLat;
                    if (fromLat < toLat) {
                        southLat = fromLat;
                        northLat = toLat;
                    } else {
                        southLat = toLat;
                        northLat = fromLat;
                    }
                    var westLng;
                    var eastLng;
                    if (fromLng < toLng) {
                        westLng = fromLng;
                        eastLng = toLng;
                    } else {
                        westLng = toLng;
                        eastLng = fromLng;
                    }

                    var southWest = new google.maps.LatLng(southLat, westLng);
                    var northEast = new google.maps.LatLng(northLat, eastLng);
                    console.log('map bounds: ', southWest, northEast);

                    map.fitBounds(new google.maps.LatLngBounds(southWest, northEast));
                }

                //reset search input
                if (from) from.setMap(null);
                if (fromCircle) fromCircle.setMap(null);
                if (to) to.setMap(null);
                if (toCircle) toCircle.setMap(null);

                var fromPosition = new google.maps.LatLng(fromLat, fromLng);
                var toPosition = new google.maps.LatLng(toLat, toLng);
                var fromRadius = fromTolerance * 1000; //Google wants it in meters
                var toRadius = toTolerance * 1000; //Google wants it in meters

                from = new google.maps.Marker({
                    position: fromPosition,
                    map: map,
                    title: 'From'
                });
                fromCircle = new google.maps.Circle({
                    center: fromPosition,
                    clickable: false,
                    fillColor: "#FFFF00",
                    fillOpacity: 0.35,
                    map: map,
                    radius: fromRadius,
                    strokeColor: "#FFFF00",
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
                    fillColor: "#00F000",
                    fillOpacity: 0.35,
                    map: map,
                    radius: toRadius,
                    strokeColor: "#00F000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                });

                var options = {
                    'fromLat': fromLat,
                    'fromLng': fromLng,
                    'fromTol': fromTolerance,
                    'toLat':toLat,
                    'toLng':toLng,
                    'toTol':toTolerance,
                    'date':date,
                    'dateTol':dateTolerance
                };
                now.searchLift(options);
            }
        });


        now.showSearchResult = function (lifts) {
            //reset search result
            $('#search-result').html('');
            $.each(directions, function(index, direction) { direction.setMap(null) });
            directions = [];

            //print and plot results
            if (lifts.length === 0) {
                $('#search-result').append('No lifts found.');
            } else {
                $('#search-result').append('<lu>');
                $.each(lifts, function (index, lift) {
                    var liftDescription = lift.from.city + ', ' + lift.to.city + ', ' + moment(lift.date).format('DD/MM/YYYY HH:mm') + ', ' + lift.time_flexibility;
                    var li = $('<li></li>');
                    li.text(liftDescription);
                    li.hover(
                            function() {
                                var direction = directions[index];
                                direction.setOptions({
                                    polylineOptions: {
                                        strokeColor: 'red'
                                    }
                                })
                                direction.setDirections(direction.getDirections());
                            },
                            function(){
                                var direction = directions[index];
                                direction.setOptions({
                                    polylineOptions: {
                                        strokeColor: 'blue'
                                    }
                                })
                                direction.setDirections(direction.getDirections());
                            }
                    );
                    $('#search-result').append(li);

                    //Remember:
                    // MongoDB uses a different order (lng,lat)
                    var o = new google.maps.LatLng(lift.from.coord[1], lift.from.coord[0]);
                    var d = new google.maps.LatLng(lift.to.coord[1], lift.to.coord[0]);
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
                            strokeColor: 'blue'
                        },
                        markerOptions: {
                            flat: true
                            //title: lift.from.city + ' - ' + lift.to.city
                        }
                    });

                    directionsService.route(request, function (result, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            console.log('route: ', result);
                            //Hack:
                            // set infowindow content for the A-B markers
                            result.routes[0].legs[0].start_address = lift.from.city;
                            result.routes[0].legs[0].end_address = lift.to.city;

                            directionsRenderer.setDirections(result);
                        }
                    });
                });
                $('#search-result').append("</lu>");
            }
        };
    }
});

var configureToleranceControls = function(form, map, toleranceDefault, toleranceMax) {
    var fromControl = $('<div class="slider"></div>').get(0);
    fromControl.index = 1;

    var fromSlider = $('<div></div>');
    fromSlider.slider({
        max:toleranceMax,
        value:toleranceDefault,
        slide: function( event, ui ) {
            $('#text-from-tolerance').val('Departure around ' + ui.value + 'Km');
            $('#search-from-tolerance').val(ui.value);
            form.submit();
        }
    });
    fromControl.appendChild(fromSlider.get(0));

    var fromTolerance = $('<input type="text" id="text-from-tolerance" />');
    fromTolerance.val('Departure around ' + toleranceDefault + 'Km');
    $('#search-from-tolerance').val(toleranceDefault);
    fromControl.appendChild(fromTolerance.get(0));

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(fromControl);

    var toControl = $('<div class="slider"></div>').get(0);
    toControl.index = 1;

    var toSlider = $('<div></div>');
    toSlider.slider({
        max:toleranceMax,
        value:toleranceDefault,
        slide: function( event, ui ) {
            $('#text-to-tolerance').val('Arrival around ' + ui.value + 'Km');
            $('#search-to-tolerance').val(ui.value);
            form.submit();
        }
    });
    toControl.appendChild(toSlider.get(0));

    var toTolerance = $('<input type="text" id="text-to-tolerance" />');
    toTolerance.val('Arrival around ' + toleranceDefault + 'Km');
    $('#search-to-tolerance').val(toleranceDefault);
    toControl.appendChild(toTolerance.get(0));

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toControl);
};

var configureTimeRangeControl = function(form, map, toleranceDefault, toleranceMax) {
    var dateControl = $('<div class="slider"></div>').get(0);
    dateControl.index = 1;

    var toTolerance = $('<input type="text" id="text-date-tolerance" />');
    toTolerance.val('Within ' + toleranceDefault + ' days');
    $('#search-date-tolerance').val(toleranceDefault);
    dateControl.appendChild(toTolerance.get(0));

    var toSlider = $('<div></div>');
    toSlider.slider({
        max:toleranceMax,
        value:toleranceDefault,
        slide: function( event, ui ) {
            $('#text-date-tolerance').val('Within ' + ui.value + ' days');
            $('#search-date-tolerance').val(ui.value);
            form.submit();
        }
    });
    dateControl.appendChild(toSlider.get(0));

    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(dateControl);
};
