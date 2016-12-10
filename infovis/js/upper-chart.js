var parent_width = d3.select("#rc-upper-row").node().getBoundingClientRect().width; /* get width of parent div */
var parent_height = d3.select("#rc-upper-row").node().getBoundingClientRect().height; /* get height of parent div */

/* stretch svg to fit parent div */
var upper_chart = d3.select("#upper-chart")
    .attr("width", parent_width)
    .attr("height", parent_height);

/* set margins and customize drawing region according to them (D3 margin convention) */
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = parent_width - margin.left - margin.right,
    height = parent_height - margin.top - margin.bottom;

var x_upper_chart = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y_upper_chart = d3.scaleLinear().rangeRound([height, 0]);

var g_upper_chart = upper_chart.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("http://127.0.0.1/vis/data/data1ex.tsv", function(d) {
  d.frequency = +d.frequency;
  return d;
}, function(error, data) {
  if (error) throw error;

  x_upper_chart.domain(data.map(function(d) { return d.letter; }));
  y_upper_chart.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  g_upper_chart.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x_upper_chart));

  g_upper_chart.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y_upper_chart).ticks(10, "%"))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .style("fill", "white")
      .text("Frequency");

  g_upper_chart.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x_upper_chart(d.letter); })
      .attr("y", function(d) { return y_upper_chart(d.frequency); })
      .attr("width", x_upper_chart.bandwidth())
      .attr("height", function(d) { return height - y_upper_chart(d.frequency); });
});
