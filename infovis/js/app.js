/* Created and maintained by Piotr Tekieli */
/* Last modification on 21.12.2016 by Piotr Tekieli */

$(document).foundation(); /* For handling Foundation 6 framework */

/* Declare (define) necessary variables and clean them to avoid memory leak */
var NURI = "data/wdi/wdi_numbers.json", PURI = "data/wdi/wdi_percent.json",
AvailableNumericSeries = [], AvailablePercentageSeries = [], 
Categories = [], NumericCategogies = [], Years = [], DataSeries = [];
AvailableNumericSeries.length = 0, AvailablePercentageSeries.length = 0, 
Categories.length = 0, Years.length = 0, DataSeries.length = 0,
DataMax = 0, DataMin = 0;

/* Populate appropriate array with passed data retrieved from JSONs */
function PopulateArray(database, uri) {
    if (uri === NURI) { AvailableNumericSeries = database; }
    else { AvailablePercentageSeries = database; };
};

/* Populate category selection menu with passed data (currently read row of JSON file)  */
function AddToMapCategoryForm(row) {
    if (($.inArray(row["series_name"], Categories)) === (-1)) {
        Categories.push(row["series_name"]);
        $("#selectable").append("<option value=\""+row["series_code"]+"\">" + row["series_name"] + "</option>");
    };
};

/* Read each row of data stream obtained from JSON file and populate two selection menus in the configuration panel */
function PopulateMapForms(series) {    
    for (row of series) {
        AddToMapCategoryForm(row);       
    };  

    for (i = 2000; i < 2015; i++) {
        $("#selectable2").append("<option value=\"" + i + "\">" + i + "</option>");  
    };
    
    $("#selectable2 option[value=\"" + 2014 + "\"").prop("selected", "selected"); /* Set default value of "Year" menu to 2014 */

    PushDataToMap(series, series[0]["series_code"], "2014");    
};

/* Push retrieved data to map module for genereting countries tiles */
function PushDataToMap(series, category, year) {    
    DataSeries.length = 0; /* Reset DataSeries storage */
    for (row of series) {
        if (row["series_code"] === category) {            
            DataSeries.push(row[year]); /* If the currently read category (row) matches with the one selected in Category menu, push to storage */            
        };
    }
    /* Estimate MAX and MINs for calculating legend's boundry values */
    DataMin = Math.min.apply(null, DataSeries); 
    DataMax = Math.max.apply(null, DataSeries);
    DataMin = Math.floor(DataMin);
    DataMax = Math.ceil(DataMax);
    LoadMap(); /* Reload map with new data */
}

/* Load map module, display grid without tiles */
var map = L.map('map').setView([52.520008, 13.404954], 4);
var legend = L.control({position: 'bottomright'});
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJnb25lIiwiYSI6ImNpdzJidTR6bTAwMXAyeW15N3hsa2c0NnIifQ.KPL00OFjX6lRS8W5yN0eYA', {
    maxZoom: 5    
}).addTo(map);

/* Use JQuery to load data stored in JSON files to appropriate arrays for further processing */
$.getJSON(NURI, function(data) { PopulateArray(data, NURI); });
$.getJSON(PURI, function(data) { PopulateArray(data, PURI); PopulateMapForms(AvailablePercentageSeries); });