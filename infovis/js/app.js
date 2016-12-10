$(document).foundation();

var AvailableSeries = [], DataSeries = [];
AvailableSeries.length = 0;
DataSeries.length = 0;

d3.csv("data/wdi/wdi.csv", function(loadedRows) {
   var WDI_CSV = loadedRows;  
   PopulateForms(WDI_CSV);
});

function PopulateForms(WDI_CSV) {
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
    var temp_counter = 0;
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

/* Initialize MAP Module */
var map = L.map('map').setView([52.520008, 13.404954], 4);
var legend = L.control({position: 'bottomright'});

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJnb25lIiwiYSI6ImNpdzJidTR6bTAwMXAyeW15N3hsa2c0NnIifQ.KPL00OFjX6lRS8W5yN0eYA', {
    maxZoom: 5    
}).addTo(map);