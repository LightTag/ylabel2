import React, { FunctionComponent } from "react";
import { select } from "d3-selection";

import { scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { area, line } from "d3-shape";
import { fade } from "@material-ui/core/styles/colorManipulator";

import getRunResults from ".//getRunResults";
import colorManaer from "../utils/labelsetcolors/labelsetcolors";

async function makeChart() {
  var margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;
  var svg = select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const data = await getRunResults();
  logger(data);

  const arrays = Object.values(data);
  const firstObject = arrays[0];
  if (firstObject === undefined) {
    return;
  }
  var x = scaleLinear().domain([-1, firstObject.length]).range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x));

  // Add Y axis
  var y = scaleLinear().domain([-0.5, 1.1]).range([height, 0]);
  svg.append("g").call(axisLeft(y));

  Object.entries(data).forEach(([label, steps]) => {
    // Show confidence interval
    const lcolor = colorManaer.getLabelColor(label);
    const acolor = fade(lcolor, 0.25);
    logger(label, lcolor, steps);

    svg
      .append("path")
      .datum(steps)
      .attr("fill", acolor)
      .attr("stroke", "none")
      .attr(
        "d",
        area<typeof steps extends Array<infer U> ? U : never>()
          .x((aa, ix) => x(ix) as number)

          .y0((aa) => y(aa.lower || Math.random() * 0.01) as number)

          .y1((aa) => y(aa.upper || Math.random() * 0.01) as number)
      );

    // Add the line
    svg
      .append("path")
      .datum(steps)
      .attr("fill", "none")
      .attr("stroke", lcolor)
      .attr("stroke-width", 1.5)
      .attr(
        "d",

        line<typeof steps extends Array<infer U> ? U : never>()
          .x((aa, ix) => x(ix) as number)
          .y((aa) => y(aa.mean || Math.random() * 0.01) as number)
      );
  });
}

const D3Chart: FunctionComponent = () => {
  const [refreshNum, setRefreshNum] = React.useState<number>(1);
  React.useEffect(() => {
    setTimeout(makeChart, 200);
  }, [refreshNum]);
  return (
    <div
      id={"chart"}
      onClick={() => setRefreshNum(refreshNum + 1)}
      key={refreshNum}
    />
  );
};

export default D3Chart;
