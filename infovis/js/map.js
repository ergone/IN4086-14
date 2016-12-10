var map = L.map('map').setView([52.520008, 13.404954], 4);
var value_ds = 0;
var legend = L.control({position: 'bottomright'});
var URIs = ["data/geojson/AUT.geo.json", "data/geojson/BEL.geo.json", "data/geojson/BGR.geo.json", 
           "data/geojson/CYP.geo.json", "data/geojson/CZE.geo.json", "data/geojson/DEU.geo.json",
           "data/geojson/DNK.geo.json", "data/geojson/ESP.geo.json", "data/geojson/EST.geo.json", 
           "data/geojson/FIN.geo.json", "data/geojson/FRA.geo.json", "data/geojson/GBR.geo.json",
           "data/geojson/GRC.geo.json", "data/geojson/HRV.geo.json", "data/geojson/HUN.geo.json", 
           "data/geojson/IRL.geo.json", "data/geojson/ITA.geo.json", "data/geojson/LTU.geo.json",
           "data/geojson/LUX.geo.json", "data/geojson/LVA.geo.json", "data/geojson/MLT.geo.json", 
           "data/geojson/NLD.geo.json", "data/geojson/POL.geo.json", "data/geojson/PRT.geo.json",
           "data/geojson/ROU.geo.json", "data/geojson/SVK.geo.json", "data/geojson/SVN.geo.json", 
           "data/geojson/SWE.geo.json"];

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEBD6';
};

function style(value) {
    return {
        fillColor: getColor(value),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.65
    };
}

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJnb25lIiwiYSI6ImNpdzJidTR6bTAwMXAyeW15N3hsa2c0NnIifQ.KPL00OFjX6lRS8W5yN0eYA', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 5,    
}).addTo(map);

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 12.5, 25, 37.5, 50, 87.5, 100],
        labels = [];           
    for (var i = 0; i < grades.length; i++) {        
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + " " + (grades[i + 1] ? '&ndash; ' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(map);

function addDataToMap(data, map) {    
    var current = data_series[value_ds++];
    var dataLayer = L.geoJson(data, {
        style: style(current),              
        onEachFeature: function(feature, layer) {        
            var popupText = "<b>" + feature.properties.name + "</b>"
                + "<br>Code: " + feature.id
                + "<br>Value: " + ((current*1).toFixed(2));
            layer.bindPopup(popupText); }
        });
    dataLayer.addTo(map);
}


for (let URI of URIs) {
    $.getJSON(URI, function(data) { addDataToMap(data, map); });
}

