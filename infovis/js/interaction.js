$('#selectable').on('change', function() {   
    PushDataToMap(AvailablePercentageSeries, $(this).val(), $("#selectable2").val());
    drawChart();
});

$('#selectable2').on('change', function() {   
    PushDataToMap(AvailablePercentageSeries, $("#selectable").val(), $(this).val());
});