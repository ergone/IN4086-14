/* Created and maintained by Piotr Tekieli */
/* Last modification on 21.12.2016 by Piotr & Nuha (L31 - L58) */

$('#selectable').on('change', function() {
    /* Initilize country tiles' drawing function */
    PushDataToMap(AvailablePercentageSeries, $(this).val(), $("#selectable2").val());

    /* Initilize stacked bar chart drawing function */
    drawChart(null);

    /* Initilize line chart drawing function */
    var currSeriesCode = $(this).val();
    $("#curr-series-code").val(currSeriesCode + ".V");
    drawLineChart();
});

$('#selectable2').on('change', function() {
    /* Initilize country tiles' drawing function */
    PushDataToMap(AvailablePercentageSeries, $("#selectable").val(), $(this).val());
});

function mapToBarChartClick(data) {
    for (var AuxIndex = 0; AuxIndex < AvailablePercentageSeries.length; AuxIndex++) {
        if ((AvailablePercentageSeries[AuxIndex]["series_name"] === $('#selectable option:selected').text()) && (AvailablePercentageSeries[AuxIndex]["country_code"] === data)) {
            UCdata = [[AvailableNumericSeries[AuxIndex]["country_code"], AvailableNumericSeries[AuxIndex + 2][$('#selectable2 option:selected').text()], AvailableNumericSeries[AuxIndex + 1][$('#selectable2 option:selected').text()]]];
            drawChart();
        }
    }
};

// change line chart to selected country when one of the lines is clicked
function lineChartClick(d) {
    // set parameters
    $("#curr-country-code").val(d.name);
    $("#curr-year").val(d.year);
    $("#selectable2").val(d.year);
        
    PushDataToMap(AvailablePercentageSeries, $("#selectable").val(), $("#selectable2").val());    
    drawChart(null);    
    drawLineChart();
};

// change line chart to selected country when the map is clicked
function mapToLineChartClick(countryCode){
    // set country code
    $("#curr-country-code").val(countryCode);

    // draw line chart
    drawLineChart();
};

// reset line chart
$('.btnrst').click(function(){
    $("#curr-country-code").val("ALL");
    drawLineChart();
    UCdata = null;
    drawChart(null);
});