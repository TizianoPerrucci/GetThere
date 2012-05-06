$(document).ready(function () {

    configureMapAutocompletion('#lift-from');
    focusIfExist('#lift-from');
    configureMapAutocompletion('#lift-to');
    configureDatepicker('#lift-date');
    configureClockpick('#lift-time');

    configureMapAutocompletion('#search-from');
    focusIfExist('#search-from');
    configureMapAutocompletion('#search-to');
    configureDatepicker('#search-date');
    configureClockpick('#search-time');

    //////////

    function configureMapAutocompletion(elemId) {
        var options = {
            types:['(cities)']
        };

        $(elemId).each(function (index) {
            var autocomplete = new google.maps.places.Autocomplete(this, options);

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var lngElem = elemId + '-lng';
                var latElem = elemId + '-lat';

                var place = autocomplete.getPlace();
                $(lngElem).val(place.geometry.location.lng());
                $(latElem).val(place.geometry.location.lat());
            });
        });
    }

    function configureDatepicker(elemId) {
        if ($(elemId).length > 0) {
            $(elemId).datepicker();
            $(elemId).datepicker( "option", "dateFormat", "dd/mm/yy" );
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
                layout: 'Horizontal'
            });
        }
    }

    function focusIfExist(elemId) {
        if ($(elemId).length > 0) {
            $(elemId).focus();
        }
    }
});
