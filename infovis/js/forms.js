var AvailableSeries = [], DataSeries = [];
AvailableSeries.length = 0;
DataSeries.length = 0;

function PopulateForms() {
    /* Populate categories of MAP section, set default value (5th series code)*/
    for (row of WDI_CSV) {
        if (($.inArray(row["Series Name"], AvailableSeries)) === (-1)) {
                AvailableSeries.push(row["Series Name"]);
                $("#selectable").append("<option value=\"" + row["Series Code"] + "\">" +
                    row["Series Name"] + "</option>");
            };
    };
    $("#selectable option[value=\"" + WDI_CSV[4]["Series Code"] + "\"]").prop("selected", "selected");
    AvailableSeriesDefault = AvailableSeries[4];       
    row = null;
    for (row of WDI_CSV) {
        if (row["Series Name"] === AvailableSeriesDefault) {            
            DataSeries.push(row["2014 [YR2014]"]);
        }
    }
    /* Populate years of MAP section, set default value (2014) */    
    for (i = 2000; i < 2015; i++) {
        $("#selectable2").append("<option value=\"" + "[YR" + i + "]" + "\">" + i + "</option>");  
    };
    $("#selectable2 option[value=\"[YR" + 2014 + "]\"").prop("selected", "selected");
};

PopulateForms();