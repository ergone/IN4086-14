$('#selectable').on('change', function() {   
    PushDataToMap(AvailablePercentageSeries, $(this).val(), $("#selectable2").val());
    drawChart();

    var currSeriesCode = $(this).val();
    $("#curr-series-code").val(currSeriesCode + ".V");
    drawLineChart();
});

$('#selectable2').on('change', function() {   
    PushDataToMap(AvailablePercentageSeries, $("#selectable").val(), $(this).val());

    var currYear = $(this).val();
    $("#curr-year").val(currYear);
});

$('#curr-series-code').on('change', function(){
    drawLineChart();
})