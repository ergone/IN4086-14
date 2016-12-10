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

function style(ValueForColor) {
    return {
        fillColor: getColor(ValueForColor),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.65
    };
};

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 12.5, 25, 37.5, 50, 87.5, 100],
        labels = [];           
    for (i = 0; i < grades.length; i++) {        
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + ' ' + (grades[i + 1] ? '&ndash; ' + grades[i + 1] + '<br>' : '');
    }
    return div;
};

legend.addTo(map);

function addDataToMap(data, map) {    
    dataLayer = L.geoJson(data, {
        style: style(DataSeries[0]),              
        onEachFeature: function(feature, layer) {        
            popupText = "<b>" + feature.properties.name + "</b>"
                + "<br>Code: " + feature.id
                + "<br>Value: " + (DataSeries[0]*1).toFixed(2);
            layer.bindPopup(popupText); }
        });
    dataLayer.addTo(map);
}

$(document).ready(finito);

function finito() {
for (URI of URIs) {    
    $.getJSON(URI, function(data) { addDataToMap(data, map); });
}
};