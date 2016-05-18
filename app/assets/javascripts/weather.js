// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

function fahrenheit(celcius) {
  return +celcius * 0.1 * 9/5 + 32;
}

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

  // add focus circles
  var bisectDate = d3.bisector(function(d) { return d.reading_date; }).left,
      focusMin = svg.append("g").style("display", "none"),
      focusMax = svg.append("g").style("display", "none");

  // fetch and process the data
  $.getJSON('/weather/data', function(data) {
    data = data.readings;

    // NOTE: temperature in tenths of degrees C
    var readingTypes = function(reading) { return reading.reading_type };
    var readings = data.reduce(function(readings, reading) {
      reading.reading_date = parseDate(reading.reading_date);
      reading.reading_value = fahrenheit(reading.reading_value);
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

    // append the circle at the intersection
    focusMin.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "black")
        .attr("r", 4);
    focusMax.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "black")
        .attr("r", 4);

    // append a text label to the max temp line for the daily temp change
    focusMax.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focusMax.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // append the line between the max and min temperature circles
    focusMax.append("line")
        .attr("class", "x")
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append a rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() {
          focusMin.style("display", null);
          focusMax.style("display", null);
        })
        .on("mouseout", function() {
          focusMin.style("display", "none");
          focusMax.style("display", "none");
        })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0    = x.invert(d3.mouse(this)[0]),
          iMin  = bisectDate(readings[1].values, x0, 1),
          d0Min = readings[1].values[iMin - 1],
          d1Min = readings[1].values[iMin],
          dMin  = x0 - d0Min.reading_date > d1Min.reading_date - x0 ? d1Min : d0Min;
          iMax  = bisectDate(readings[0].values, x0, 1),
          d0Max = readings[0].values[iMax - 1],
          d1Max = readings[0].values[iMax],
          dMax  = x0 - d0Max.reading_date > d1Max.reading_date - x0 ? d1Max : d0Max,
          delta = (dMax.reading_value - dMin.reading_value).toFixed(1);

      focusMin.select("circle.y")
          .attr("transform",
                "translate(" + x(dMin.reading_date) + "," +
                               y(dMin.reading_value) + ")");
      focusMax.select("circle.y")
          .attr("transform",
                "translate(" + x(dMax.reading_date) + "," +
                               y(dMax.reading_value) + ")");

      focusMax.select("text.y1")
          .text(delta + 'º')
          .attr("transform",
                "translate(" + x(dMax.reading_date) + "," +
                               y(dMax.reading_value) + ")");
      focusMax.select("text.y2")
          .text(delta + 'º')
          .attr("transform",
                "translate(" + x(dMax.reading_date) + "," +
                               y(dMax.reading_value) + ")");

      focusMax.select(".x")
              .attr("transform",
                    "translate(" + x(dMax.reading_date) + "," +
                                   y(dMax.reading_value) + ")")
                         .attr("y2", y(dMin.reading_value) - y(dMax.reading_value));
    }
  });
}

function makeHeatMap() {
  var width    = 960,
      height   = 136,
      cellSize = 17, // cell size
      // blue, green, yellow, orange, red
      colors   = ['#0000FF', '#00FF00', '#FFFF00', '#FFA500', '#FF0000'],
      format   = d3.time.format("%Y-%m-%d"),
      decimal  = d3.format(".1f");

  // draw the year(s)
  var svg = d3.select("body").selectAll("svg")
      .data(d3.range(1836, 1837))
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn")
    .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  // year label to the left of the calendar
  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

  // fill in the calendar(s)
  var rect = svg.selectAll(".day")
      .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
      .attr("y", function(d) { return d.getDay() * cellSize; })
      .datum(format);

  // mouseover title
  rect.append("title")
      .text(function(d) { return d; });

  var monthPath = function(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
        d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  }

  // darker line to separate the months of the year
  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);

  d3.json('/weather/heatmap_data.json', function(error, readings) {
    var data = [],
        min  = Infinity,
        max  = -Infinity;
    readings.forEach(function(reading) {
      // type coersions and temperature conversion
      var temperature = fahrenheit(reading.reading_value);
      data[reading.reading_date] = {
        id          : +reading.id,
        temperature : temperature,
        date        : new Date(reading.reading_date),
      };
      if (temperature < min) { min = temperature }
      if (temperature > max) { max = temperature }
    });

    var color = d3.scale.quantize().domain([min, max]).range(colors);

    rect.filter(function(key) { return key in data; })
        .style("fill", function(key) { return color(data[key].temperature); })
      .select("title")
        .text(function(key) { return key + ": " + decimal(data[key].temperature); });
  });
}
