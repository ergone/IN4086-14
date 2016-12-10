var parent_width2 = d3.select("#rc-lower-row").node().getBoundingClientRect().width; /* get width of parent div */
var parent_height2 = d3.select("#rc-lower-row").node().getBoundingClientRect().height; /* get height of parent div */

/* stretch svg to fit parent div */
var lower_chart = d3.select("#lower-chart")
    .attr("width", parent_width2)
    .attr("height", parent_height2);

/* set margins and customize drawing region according to them (D3 margin convention) */
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = parent_width - margin.left - margin.right,
    height = parent_height - margin.top - margin.bottom;

var g_lower_chart = lower_chart.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%d-%b-%y");

var x_lower_chart = d3.scaleTime()
    .rangeRound([0, width]);

var y_lower_chart = d3.scaleLinear()
    .rangeRound([height, 0]);

var lower_chart_line = d3.line()
    .x(function(d) { return x_lower_chart(d.date); })
    .y(function(d) { return y_lower_chart(d.close); });

d3.tsv("http://127.0.0.1/vis/data/data2ex.tsv", function(d) {
  d.date = parseTime(d.date);
  d.close = +d.close;
  return d;
}, function(error, data) {
  if (error) throw error;

  x_lower_chart.domain(d3.extent(data, function(d) { return d.date; }));
  y_lower_chart.domain(d3.extent(data, function(d) { return d.close; }));

  g_lower_chart.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x_lower_chart));

  g_lower_chart.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y_lower_chart))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  g_lower_chart.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", lower_chart_line);
});