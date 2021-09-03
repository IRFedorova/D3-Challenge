
// Main Requirement

// Grab the width of the containing box
var width = parseInt(d3.select("#scatter").style("width"));

// Designate the height of the graph
var height = width - width / 4;

// Margin spacing for graph
var margin = 20;

// space for placing words
var labelArea = 110;

// padding for the text at the bottom and left axes
var tPadBot = 40;
var tPadLeft = 40;

// Create the actual canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Set the radius for each dot that will appear in the graph.
var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 9;
  }
  else {
    circRadius = 12;
  }
}
crGet();

// A) Bottom Axis

// We create a group element to nest our bottom axes labels.
svg.append("g").attr("class", "xText");
// xText - to select the group without excess code.
var xText = d3.select(".xText");


function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

//  xText to append three text SVG files
// position and space between label vertically.
// 1. Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// // 2. Age
// xText
//   .append("text")
//   .attr("y", 0)
//   .attr("data-name", "age")
//   .attr("data-axis", "x")
//   .attr("class", "aText inactive x")
//   .text("Age (Median)");
// // 3. Income
// xText
//   .append("text")
//   .attr("y", 26)
//   .attr("data-name", "income")
//   .attr("data-axis", "x")
//   .attr("class", "aText inactive x")
//   .text("Household Income (Median)");

// B) Left Axis

// variables to make space for attributes to be more readable.
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Y axes label group
svg.append("g").attr("class", "yText");

// yText will allows us to select the group without excess code.
var yText = d3.select(".yText");

  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );


// // Now we append the text.
// // 1. Obesity
// yText
//   .append("text")
//   .attr("y", -26)
//   .attr("data-name", "obesity")
//   .attr("data-axis", "y")
//   .attr("class", "aText active y")
//   .text("Obese (%)");

// // 2. Smokes
// yText
//   .append("text")
//   .attr("x", 0)
//   .attr("data-name", "smokes")
//   .attr("data-axis", "y")
//   .attr("class", "aText inactive y")
//   .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
//   .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// 2. Import  .csv file. 
d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

// 3. Create visualization function
function visualize(theData) {
 // Variables for Text in ToolTips
  var curX = "poverty";
  var curY = "obesity";
  
  var xMin;
  var xMax;
  var yMin;
  var yMax;

   // This function allows us to set up tooltip rules (see d3-tip.js).
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      // x key
      var theX;
      // Grab the state name.
      var theState = "<div>" + d.state + "</div>";
      // Snatch the y value's key and value.
      var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
      // If the x key is poverty
      if (curX === "poverty") {
        // Grab the x key and a version of the value formatted to show percentage
        theX = "<div>" + curX + ": " + d[curX] + "%</div>";
      }
      else {
        // Otherwise
        // Grab the x key and a version of the value formatted to include commas after every third digit.
        theX = "<div>" +
          curX +
          ": " +
          parseFloat(d[curX]).toLocaleString("en") +
          "</div>";
      }
      // Display what we capture.
      return theState + theX + theY;
    });
  // Call the toolTip function
  svg.call(toolTip);


  // PART 2:
  // These functions remove some repitition from later code.
 
  // a. change the min and max for x
  function xMinMax() {
    // min will grab the smallest datum from the selected column.
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  // b. change the min and max for y
  function yMinMax() {
    // min will grab the smallest datum from the selected column.
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  // c. change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  // Part 3: Instantiate the Scatter Plot
 
  xMinMax();
  yMinMax();

  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inverses due to how d3 calc's y-axis placement
    .range([height - margin - labelArea, margin]);

  // We pass the scales into the axis methods to create the axes.
  // Note: D3 4.0 made this a lot less cumbersome then before. Kudos to mbostock.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

   svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Now let's make a grouping for our dots and their labels.
  var theCircles = svg.selectAll("g theCircles").data(theData).enter();

  // We append the circles for each row of data (or each state, in this case).
  theCircles
    .append("circle")
    // These attr's specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[curX]);
    })
    .attr("cy", function(d) {
      return yScale(d[curY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // Hover rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // With the circles on our graph, we need matching labels.
  theCircles
    .append("text")
    // We return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    // Now place the text using our scale.
    .attr("dx", function(d) {
      return xScale(d[curX]);
    })
    .attr("dy", function(d) {

      return yScale(d[curY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // // Part 4: Make the Graph Dynamic

  // // Select all axis text and add this d3 click event.
  // d3.selectAll(".aText").on("click", function() {

  //   var self = d3.select(this);

  //   if (self.classed("inactive")) {
  //     // Grab the name and axis saved in label.
  //     var axis = self.attr("data-axis");
  //     var name = self.attr("data-name");

  //     // When x is the saved axis, execute this:
  //     if (axis === "x") {
  //       // Make curX the same as the data name.
  //       curX = name;

  //       // Change the min and max of the x-axis
  //       xMinMax();

  //       // Update the domain of x.
  //       xScale.domain([xMin, xMax]);

  //       // Now use a transition when we update the xAxis.
  //       svg.select(".xAxis").transition().duration(300).call(xAxis);

  //       // With the axis changed, let's update the location of the state circles.
  //       d3.selectAll("circle").each(function() {

  //         d3
  //           .select(this)
  //           .transition()
  //           .attr("cx", function(d) {
  //             return xScale(d[curX]);
  //           })
  //           .duration(300);
  //       });

  //       // We need change the location of the state texts, too.
  //       d3.selectAll(".stateText").each(function() {
  //         // We give each state text the same motion tween as the matching circle.
  //         d3
  //           .select(this)
  //           .transition()
  //           .attr("dx", function(d) {
  //             return xScale(d[curX]);
  //           })
  //           .duration(300);
  //       });

  //       // Finally, change the classes of the last active label and the clicked label.
  //       labelChange(axis, self);
  //     }
  //     else {
  //       // When y is the saved axis, execute this:
  //       // Make curY the same as the data name.
  //       curY = name;

  //       // Change the min and max of the y-axis.
  //       yMinMax();

  //       // Update the domain of y.
  //       yScale.domain([yMin, yMax]);

  //       // Update Y Axis
  //       svg.select(".yAxis").transition().duration(300).call(yAxis);

  //       // With the axis changed, let's update the location of the state circles.
  //       d3.selectAll("circle").each(function() {
  //         // Each state circle gets a transition for it's new attribute.
  //         // This will lend the circle a motion tween
  //         // from it's original spot to the new location.
  //         d3
  //           .select(this)
  //           .transition()
  //           .attr("cy", function(d) {
  //             return yScale(d[curY]);
  //           })
  //           .duration(300);
  //       });

  //       // We need change the location of the state texts, too.
  //       d3.selectAll(".stateText").each(function() {
  //         // We give each state text the same motion tween as the matching circle.
  //         d3
  //           .select(this)
  //           .transition()
  //           .attr("dy", function(d) {
  //             return yScale(d[curY]) + circRadius / 3;
  //           })
  //           .duration(300);
  //       });

  //       // Finally, change the classes of the last active label and the clicked label.
  //       labelChange(axis, self);
  //     }
  //   }
  // });


}
