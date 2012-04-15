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

        now.showSearchResult = function (lifts) {
            $('#search-result').html("<p>Search Result:</p>");
            $('#search-result').append("<lu>");
            $.each(lifts, function (index, lift) {
                $('#search-result').append('<li>' + lift.from + ', ' + lift.to + ', ' + lift.date + ', ' + lift.time +
                        ', ' + lift.time_flexibility + '</li>');
            });
            $('#search-result').append("</lu>");
        };
    }

});