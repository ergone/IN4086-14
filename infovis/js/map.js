/* Created and maintained by Piotr Tekieli */
/* Last modification on 21.12.2016 by Piotr Tekieli */

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
var RGBGradient = ['#FFFFFF', '#FCE5EA', '#F9CCD5', '#F7B2C0', '#F499AB', '#F27F96', '#EF6681', 
                   '#EC4C6C', '#EA3357', '#E71942', '#E5002D'];

var LayerCollection = [], GradeCollection = [];
var StepValue = 0, SteppingGrade = 5;

/* Clear existing map tiles */
function ClearMapLayers() {
    for (var i = 0; i < LayerCollection.length; i++) {       
            map.removeLayer(LayerCollection[i]); 
        }        
        LayerCollection.length = 0;
};

/* Based on the passed percentage, return color value for legend tiles */
function ReturnColor(d) {
    if (GradeCollection[1] >= d && d > GradeCollection[0])                      { return RGBGradient[2]; }
    else if (GradeCollection[2] >= d && d > GradeCollection[1])                 { return RGBGradient[4]; }
    else if (GradeCollection[3] >= d && d > GradeCollection[2])                 { return RGBGradient[6]; }
    else if (GradeCollection[4] >= d && d > GradeCollection[3])                 { return RGBGradient[8]; }
    else if ((GradeCollection[5] >= d && d > GradeCollection[4]) || d === 100)  { return RGBGradient[10]; }    
    else                                                                        { return '#000000' }    
};

/* Set a default style for legend's tiles, initilize the aforementioned colouring function*/
function SetStyle(ValueForColor) {
    return {
        fillColor: ReturnColor(ValueForColor),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.65 /* Set the same opacity as for map tiles */
    };
};

/* Add countries tiles to the map */
var JSONcounter = 0;
function addDataToMap(data, map) {    
    dataLayer = L.geoJson(data, {
        style: SetStyle(DataSeries[JSONcounter]),              
        /* Create popup menus for the tiles */
        onEachFeature: function(feature, layer) {            
            popupText = "<b>" + feature.properties.name + "</b>"
                + "<br>Code: " + feature.id
                + "<br>Value: " + (DataSeries[JSONcounter++]*1).toFixed(2)                
                + "<br><button class=\"btn btn-primary\" onclick=\"mapToLineChartClick('" + feature.id + "'); mapToBarChartClick('" + feature.id + "')\">Highlight<button>";
            layer.bindPopup(popupText); }
        });
    dataLayer.addTo(map);
    LayerCollection.push(dataLayer);
}

/* Load countries tiles */ 
function LoadMap() {    
    ClearMapLayers(); /* Clear existing tiles (used for re-loading script during runtime) */
    for (URI of URIs) { $.getJSON(URI, function(data) { addDataToMap(data, map); }); } /* Get data from GEOJSON files */
    JSONcounter = 0; /* Clear JSONcounter value (used for re-loading script during runtime) */
    legend.onAdd = function (map) {        
        /* Calculate appropriate stepping for the scope of percentage values */
        var DataAux = DataMin;
        StepValue = ((DataMax - DataMin) / SteppingGrade);              
        GradeCollection.length = 0;
        var aux = 0;
        /* Push the calculations to the associated collection storage */
        for (DataAux; DataAux < DataMax; DataAux += StepValue) {            
            GradeCollection.push(+DataAux.toFixed(0));    
        };
        if (GradeCollection[GradeCollection.length - 1] !== DataMax) {
            GradeCollection.push(DataMax);
        };
        /* Generate legend div */
        var div = L.DomUtil.create("div", "info legend"); /* Use auxiliary function provided by Leaflet to help facilitate the process */                
            div.innerHTML += '<p>Legend</p>';
            div.style.background = "rgba(0,0,0,0.35)"; /* Introduce limited transparency */        
        if (GradeCollection.length === 1) {
           div.innerHTML +=
                '<i style="background:' + RGBGradient[10] + '"></i> ' +
                (GradeCollection[0] ? GradeCollection[0] + "% " : ' ') + (GradeCollection[1] ? '&ndash; ' + GradeCollection[1] + '% <br>' : ' '); /* Create single gradient square with a label */
        };
        for (i = 0; i < GradeCollection.length - 1; i++) {        
            div.innerHTML +=
                '<i style="background:' + ReturnColor(GradeCollection[i] + 1) + '"></i> ' +
                (GradeCollection[i + 1] ? GradeCollection[i] + "% " : ' ') + (GradeCollection[i + 1] ? '&ndash; ' + GradeCollection[i + 1] + '% <br>' : ' '); /* Create gradient squares and labels (if many) */
        };
        return div; 
    };
    legend.addTo(map); /* Place div inside map module */
}