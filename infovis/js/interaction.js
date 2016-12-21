$('#selectable').on('change', function() {
    // draw map
    PushDataToMap(AvailablePercentageSeries, $(this).val(), $("#selectable2").val());

    // draw bar chart
    drawChart();

    // draw line chart
    var currSeriesCode = $(this).val();
    $("#curr-series-code").val(currSeriesCode + ".V");
    drawLineChart();
});

$('#selectable2').on('change', function() {
    // draw map
    PushDataToMap(AvailablePercentageSeries, $("#selectable").val(), $(this).val());
});


// change line chart to selected country when one of the lines is clicked
function lineChartClick(d) {
    // set parameters
    $("#curr-country-code").val(d.name);
    $("#curr-year").val(d.year);
    $("#selectable2").val(d.year);
    
    // draw map
    PushDataToMap(AvailablePercentageSeries, $("#selectable").val(), $("#selectable2").val());
    
    // draw bar chart
    drawChart();

    // draw line chart
    drawLineChart();
}

// change line chart to selected country when the map is clicked
function mapToLineChartClick(countryCode){
    // set country code
    $("#curr-country-code").val(countryCode);

    // draw line chart
    drawLineChart();
}

// reset line chart
$('.btnrst').click(function(){
    $("#curr-country-code").val("ALL");
    drawLineChart();
});