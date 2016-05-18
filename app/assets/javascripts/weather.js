// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

function makeLineChart() {
  // based on http://bl.ocks.org/mbostock/3884955
  var margin = {top: 20, right: 80, bottom: 30, left: 50},
      width  = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // define accessors for the x and y values
  var x     = d3.time.scale().range([0, width]),
      y     = d3.scale.linear().range([height, 0]);

  // setup the x and y axes
  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  // helper functions for date formatting and color(s) for the line(s)
  var parseDate  = d3.time.format("%Y-%m-%d").parse,
      color      = d3.scale.ordinal()
                     .domain(["TMAX", "TMIN"])
                     .range(["red", "blue"]);

  // define the line(s) as a series of points from the data
  var line = d3.svg.line()
      .x(function(d) { return x(d.reading_date); })
      .y(function(d) { return y(d.reading_value); });

  // add the chart SVG to the body
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // fetch and process the data
  $.getJSON('/weather/data', function(data) {
    data = data.readings;

    // NOTE: temperature in tenths of degrees C
    var readingTypes = function(reading) { return reading.reading_type };
    var readings = data.reduce(function(readings, reading) {
      reading.reading_date = parseDate(reading.reading_date);
      reading.reading_value = reading.reading_value*0.1 * 9/5 + 32;
      indices = readings.map(readingTypes);
      idx = indices.indexOf(reading.reading_type);
      if (idx > -1) {
        readings[idx].values.push(reading)
      } else {
        readings.push({
          reading_type: reading.reading_type,
          values: [reading]
        });
      }
      return readings;
    }, []);
    color.domain(readings.map(readingTypes));

    // set the upper and lower range for the axes
    x.domain(d3.extent(data, function(d) { return d.reading_date; }));
    y.domain(d3.extent(data, function(d) { return d.reading_value; }));

    // put the x axis into the graph
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // put the y axis into the graph
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");

    // create the SVG element for the line(s) and feed the data to it
    var station = svg.selectAll(".station")
        .data(readings)
      .enter().append("g")
        .attr("class", "station");

    // generate the points and line(s) based on the data
    station.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.reading_type); });

    // append a label at the end of the line for the reading type
    station.append("text")
        .datum(function(d) { return {reading_type: d.reading_type, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.reading_date) + "," + y(d.value.reading_value) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.reading_type; });
  });
}
