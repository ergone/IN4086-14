$('#selectable').on('change', function() {   
    PushDataToMap(ActiveSeries, $(this).val(), $("#selectable2").val());
});

$('#selectable2').on('change', function() {   
    PushDataToMap(ActiveSeries, $("#selectable").val(), $(this).val());
});