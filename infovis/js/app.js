$(document).foundation()

var available_series = [];
var data_series = [];
var wdi_data;

function process(active) {
    for (let row of wdi_data) {
        if (row["Series Name"] === active) {            
            data_series.push(row["2012 [YR2012]"]);
        }
    }
};

d3.csv("data/wdi/wdi_data_all.csv", function(loadedRows) {
  wdi_data = loadedRows;  
  for (let row of loadedRows) {
    if (($.inArray(row["Series Name"], available_series)) === (-1)) {
        available_series.push(row["Series Name"]);
        $("#selectable").append("<option value=\"" + row["Series Code"] + "\">" +
            row["Series Name"] + "</option>");
    }
  }
  active = available_series[4];  
  $("#selectable option[value=\"" + wdi_data[4]["Series Code"] + "\"]").prop("selected", "selected");
  process(active);
});

for (i = 2000; i < 2015; i++) {
    $("#selectable2").append("<option value=\"" + "[YR" + i + "]" + "\">" + i + "</option>");  
};



