$(document).foundation();

var NURI = "data/wdi/wdi_numbers.json", PURI = "data/wdi/wdi_percent.json",
AvailableNumericSeries = [], AvailablePercentageSeries = [], 
Categories = [], NumericCategogies = [], Years = [], DataSeries = [];
AvailableNumericSeries.length = 0, AvailablePercentageSeries.length = 0, 
Categories.length = 0, Years.length = 0, DataSeries.length = 0,
DataMax = 0, DataMin = 0;

function PopulateArray(database, uri) {
    if (uri === NURI) { AvailableNumericSeries = database; }
    else { AvailablePercentageSeries = database; };
};

function AddToMapCategoryForm(row) {
    if (($.inArray(row["series_name"], Categories)) === (-1)) {
        Categories.push(row["series_name"]);
        $("#selectable").append("<option value=\""+row["series_code"]+"\">" + row["series_name"] + "</option>");
    };
};

function AddToChartCategoryForms(row) {
    if (($.inArray(row["series_name"], NumericCategogies)) === (-1)) {
        NumericCategogies.push(row["series_name"]);
        $("#selectable3").append("<option value=\""+row["series_code"]+"\">" + row["series_name"] + "</option>");
        if (row["series_name"].includes("female") === false && row["series_name"].includes("male") === false) {
            $("#selectable4").append("<option value=\""+row["series_code"]+"\">" + row["series_name"] + "</option>");
        }
    };
};

function PopulateChartForms(series) {     
    /* Populate categories of MAP section, set default value (5th series code)*/
    for (row of series) {
        AddToChartCategoryForms(row);       
    };   
};

function PopulateMapForms(series) {     
    /* Populate categories of MAP section, set default value (5th series code)*/
    for (row of series) {
        AddToMapCategoryForm(row);       
    }; 

    /* Populate years of MAP section, set default value (2014) */    
    for (i = 2000; i < 2015; i++) {
        $("#selectable2").append("<option value=\"" + i + "\">" + i + "</option>");  
    };
    $("#selectable2 option[value=\"" + 2014 + "\"").prop("selected", "selected");

    AvailableSeriesDefault = series[0]["series_code"]; 
    ActiveYear = AvailableSeriesYDefault = "2014";   

    PushDataToMap(series, AvailableSeriesDefault, AvailableSeriesYDefault)
    
};

function PushDataToMap(series, category, year) {
    DataSeries.length = 0;
    for (row of series) {
        if (row["series_code"] === category) {            
            DataSeries.push(row[year]);            
        };
    }
    DataMin = Math.min.apply(null, DataSeries);
    DataMax = Math.max.apply(null, DataSeries);
    DataMin = Math.floor(DataMin);
    DataMax = Math.ceil(DataMax);
    LoadMap();
}

/* Initialize MAP Module */
var map = L.map('map').setView([52.520008, 13.404954], 4);
var legend = L.control({position: 'bottomright'});

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJnb25lIiwiYSI6ImNpdzJidTR6bTAwMXAyeW15N3hsa2c0NnIifQ.KPL00OFjX6lRS8W5yN0eYA', {
    maxZoom: 5    
}).addTo(map);

$.getJSON(NURI, function(data) { PopulateArray(data, NURI); PopulateChartForms(AvailableNumericSeries); });
$.getJSON(PURI, function(data) { PopulateArray(data, PURI); PopulateMapForms(AvailablePercentageSeries); });

