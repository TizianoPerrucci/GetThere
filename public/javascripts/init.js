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
});

var configureMapAutocompletion = function(elemId) {
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
};

var configureDatepicker = function(elemId) {
    if ($(elemId).length > 0) {
        //We get the original value and set it again after changing dateFormat
        //the field could be initialized before creating the datepicker (e.g. editing a lift)
        var value = $(elemId).val() || new Date();
        $(elemId).datepicker();
        $(elemId).datepicker('option', 'dateFormat', 'dd/mm/yy');
        $(elemId).datepicker('setDate', value);
    }
};

var configureClockpick = function(elemId) {
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
};

var focusIfExist = function(elemId) {
    if ($(elemId).length > 0) {
        $(elemId).focus();
    }
}
