$(document).ready(function() {

    var options = {
      types: ['(cities)']
    };

    $(':input').each(function(index) {
        if (this.name == 'lift[from]' || this.name == 'lift[to]')  {
            autocomplete = new google.maps.places.Autocomplete(this, options);
        }
    });

});