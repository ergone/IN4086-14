// declare variables
var thedata;
var currentUrl;

// javascript object for country names, country codes, series names, and series codes
var countryNames = {AUT: "Austria", BEL: "Belgium", BGR: "Bulgaria", HRV: "Croatia", CYP: "Cyprus", 
CZE: "Czech Republic", DNK: "Denmark", EST: "Estonia", FIN: "Finland", FRA: "France", DEU: "Germany", 
GRC: "Greece", HUN: "Hungary", IRL: "Ireland", ITA: "Italy", LVA: "Latvia", LTU: "Lithuania", 
LUX: "Luxembourg", MLT: "Malta", NLD: "Netherlands", POL: "Poland", PRT: "Portugal", ROM: "Romania", 
SVK: "Slovak Republic", SVN: "Slovenia", ESP: "Spain", SWE: "Sweden", GBR: "United Kingdom", ALL: "All EU Countries"};

var countryAbbr = {AUT: "AUT (Austria)", BEL: "BEL (Belgium)", BGR: "BGR (Bulgaria)", HRV: "HRV (Croatia)", CYP: "CYP (Cyprus)", 
CZE: "CZE (Czech Republic)", DNK: "DNK (Denmark)", EST: "EST (Estonia)", FIN: "FIN (Finland)", FRA: "FRA (France)", DEU: "DEU (Germany)", 
GRC: "GRC (Greece)", HUN: "HUN (Hungary)", IRL: "IRL (Ireland)", ITA: "ITA (Italy)", LVA: "LVA (Latvia)", LTU: "LTU (Lithuania)", 
LUX: "LUX (Luxembourg)", MLT: "MLT (Malta)", NLD: "NLD (Netherlands)", POL: "POL (Poland)", PRT: "PRT (Portugal)", ROM: "ROM (Romania)", 
SVK: "SVK (Slovak Republic)", SVN: "SVN (Slovenia)", ESP: "ESP (Spain)", SWE: "SWE (Sweden)", GBR: "GBR (United Kingdom)"};

var seriesAbbr = {"SL.EM.TOTL.NE.ZS.V": "Employment, total", "SL.EM.TOTL.FE.NE.ZS.V": "Employment, female", 
"SL.EM.TOTL.MA.NE.ZS.V": "Employment, male", "SL.EM.PRIM.ZS.V": "Employment with primary education", 
"SL.EM.PRIM.FE.ZS.V": "Employment with primary education, female", "SL.EM.PRIM.MA.ZS.V": "Employment with primary education, male", 
"SL.EM.SECO.ZS.V": "Employment with secondary education", "SL.EM.SECO.FE.ZS.V": "Employment with secondary education, female", 
"SL.EM.SECO.MA.ZS.V": "Employment with secondary education, male", "SL.EM.TERT.ZS.V": "Employment with tertiary education", 
"SL.EM.TERT.FE.ZS.V": "Employment with tertiary education, female", "SL.EM.TERT.MA.ZS.V": "Employment with tertiary education, male", 
"SL.TLF.TOTL.IN.V": "Labor force, total", "SL.TLF.TOTL.FE.ZS.V": "Labor force, female", "SL.TLF.TOTL.MA.ZS.V": "Labor force, male", 
"SL.TLF.PRIM.ZS.V": "Labor force with primary education", "SL.TLF.PRIM.FE.ZS.V": "Labor force with primary education, female", 
"SL.TLF.PRIM.MA.ZS.V": "Labor force with primary education, male", "SL.TLF.SECO.ZS.V": "Labor force with secondary education", 
"SL.TLF.SECO.FE.ZS.V": "Labor force with secondary education, female", "SL.TLF.SECO.MA.ZS.V": "Labor force with secondary education, male", 
"SL.TLF.TERT.ZS.V": "Labor force with tertiary education", "SL.TLF.TERT.FE.ZS.V": "Labor force with tertiary education, female", 
"SL.TLF.TERT.MA.ZS.V": "Labor force with tertiary education, male", "SL.UEM.TOTL.NE.ZS.V": "Unemployment, total", 
"SL.UEM.TOTL.FE.NE.ZS.V": "Unemployment, female", "SL.UEM.TOTL.MA.NE.ZS.V": "Unemployment, male", 
"SL.UEM.PRIM.ZS.V": "Unemployment with primary education", "SL.UEM.PRIM.FE.ZS.V": "Unemployment with primary education, female", 
"SL.UEM.PRIM.MA.ZS.V": "Unemployment with primary education, male", "SL.UEM.SECO.ZS.V": "Unemployment with secondary education", 
"SL.UEM.SECO.FE.ZS.V": "Unemployment with secondary education, female", "SL.UEM.SECO.MA.ZS.V": "Unemployment with secondary education, male", 
"SL.UEM.TERT.ZS.V": "Unemployment with tertiary education", "SL.UEM.TERT.FE.ZS.V": "Unemployment with tertiary education, female", "SL.UEM.TERT.MA.ZS.V": "Unemployment with tertiary education, male", }

// javascript extension
String.prototype.replaceAll = function(search, replace){
//if replace is not sent, return original string otherwise it will
//replace search string with 'undefined'.
if (replace === undefined) {
    return this.toString();
}
return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

// set margins
var margin = {top: 20, right: 60, bottom: 30, left: 70},
    width  = 750 - margin.left - margin.right,
    height = 300  - margin.top  - margin.bottom;

// set range for x and y axis
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .tickFormat(d3.format("s"))
    .orient("left");

// line
var line = d3.svg.line()
    .interpolate("cardinal")
    .x(function (d) { return x(d.year) + x.rangeBand() / 2; })
    .y(function (d) { return y(d.value); }); 

// color sets
var color = d3.scale.ordinal()
    .range(['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd']);

// set svg
var svg = d3.select("#rc-lower-row").append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawLineChart(){
    // get current variable to display
    var currCountryCode = $("#curr-country-code").val();
    var currSeriesCode = $("#curr-series-code").val();
    var currYear = $("#curr-year").val();
    console.log(currCountryCode + currSeriesCode + currYear);

    // get json data
    var baseUrl = "http://51.15.56.60/ws/index.php/json/data/";
    var catCode = currSeriesCode.toLowerCase().replaceAll('.','_');
    currentUrl = baseUrl + catCode + '/' + currCountryCode;

    d3.json(currentUrl, function (error, data) {

        $("#chart-title").text(seriesAbbr[currSeriesCode] + ' (' + countryNames[currCountryCode] + ')');

        //var data = thedata;
        var labelVar = 'year';
        var varNames = d3.keys(data[0]).filter(function (key) { return key !== labelVar;});

        color.domain(varNames);

        var seriesData = varNames.map(function (name) {
            return {
            name: name,
            values: data.map(function (d) {
                return {name: name, year: d[labelVar], value: +d[name]};
            })
            };
        });

        // set domain
        x.domain(data.map(function (d) { return d.year; }));

        y.domain([
            d3.min(seriesData, function (c) { 
                return d3.min(c.values, function (d) { return d.value; });
            }),
            d3.max(seriesData, function (c) { 
                return d3.max(c.values, function (d) { return d.value; });
            })
        ]);

        // remove all component in chart
        svg.selectAll("g").remove();

        // draw axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .transition().duration(1500).ease("sin-in-out")
            .call(yAxis)
        
        // y-axis name
        svg.append("g")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .attr("class", "sserif")
            .text("Number of People");
        
        // lines
        var series = svg.selectAll(".series")
            .data(seriesData)
            .enter().append("g")
            .attr("class", "series");

        series.append("path")
            .attr("class", "line")
            .transition()
            .duration(1000)
            .ease("linear")
            .attr("d", function (d) { return line(d.values); })
            .style("stroke", function (d) { return color(d.name); })
            .style("stroke-width", "2px")
            .style("fill", "none")
        
        svg.selectAll('.axis line, .axis path')
            .attr("class", "axisclass");

        // draw point
        series.selectAll(".point")
            .data(function (d) { return d.values; })
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", function (d) { return x(d.year) + x.rangeBand()/2; })
            .attr("cy", function (d) { return y(d.value); })
            .attr("r", "5px")
            .style("fill", function (d) { return color(d.name); })
            .style("stroke", "grey")
            .style("stroke-width", "2px")
            .style("font-family", "sans-serif")
            .style("color", "white")
            .on("mouseover", function (d) { showPopover.call(this, d); })
            .on("mouseout",  function (d) { removePopovers(); })
            .on("click", function(d) { removePopovers(); lineChartClick.call(this, d); })

        // remove tooltips when not mouseover
        function removePopovers () {
            $('.popover').each(function() {
            $(this).remove();
            }); 
        }

        // show tooltips when mouseover point
        function showPopover (d) {
            $(this).popover({
            title: countryAbbr[d.name],
            placement: 'auto top',
            container: '#rc-lower-row',
            trigger: 'manual',
            html : true,
            content: function() { 
                return "Year: " + d.year + 
                        "<br/>People: " + d3.format(",")(d.value ? d.value: d.y1 - d.y0); }
            });
            $(this).popover('show')
        }

    });
}

drawLineChart();
