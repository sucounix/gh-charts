const {
  handleCurrencySymbol,
  humanReadableNumber,
  formatCurrency,
} = require("../utils/currency.utils");
const puppeteerBrowser = require("../services/puppeteer.service");
const { Buffer } = require("buffer");

const getBreakeven = async (req, res) => {
  const { breakeven_data } = req.body;
  const { title, timeframe, account_name, currency } = req.body;

  const LABELS_WIDTH = 100;
  const X_BUFFER = 10;
  const Y_BUFFER = 10;
  const CHART_WIDTH = 650;
  const CHART_HEIGHT = 400;
  const Y_UNDER_CHART = 10;

  const SVG_WIDTH = LABELS_WIDTH + X_BUFFER + CHART_WIDTH;
  const SVG_HEIGHT = Y_BUFFER + CHART_HEIGHT + Y_UNDER_CHART;

  let gridString = `
   <line
   id="grid_start"
      x1="100"
      y1="0"
      x2="100"
      y2=${SVG_HEIGHT}
      stroke="#000"
    />`;
  let linesString = "";
  let threeNumbersPoints = "";
  let warningMessage = "";

  const topRevenue = breakeven_data.revenue * 2;
  const costSlope =
    (breakeven_data.total_cost - breakeven_data.fixed_cost) / 10;
  const topTotalCost = 21 * costSlope + breakeven_data.fixed_cost;
  const breakeven =
    (breakeven_data.fixed_cost / breakeven_data.contribution_margin) * 100;

  const YValueToPixels = (value) => {
    const maxValue = topRevenue;
    const minValue = 0;
    const pixelsPerUnit = CHART_HEIGHT / (maxValue - minValue);
    const y = Y_BUFFER + CHART_HEIGHT - (value - minValue) * pixelsPerUnit;
    return y;
  };

  /* 
    Add Horizontal Grid
  */
  (() => {
    for (let i = 0; i < 11; i++) {
      gridString += `<line
      x1=${LABELS_WIDTH}
      x2=${LABELS_WIDTH + CHART_WIDTH}
      y2="0"
      stroke="#000"
      transform="translate(0,${Y_BUFFER + i * (CHART_HEIGHT / 10)})"
      stroke-dasharray="12"
      stroke-opacity="0.2"
    />`;
    }
  })();

  /* 
    Add Vertical Grid
  */
  (() => {
    for (let i = 0; i < 22; i++) {
      gridString += `<line
        x1="${LABELS_WIDTH + (CHART_WIDTH / 22) * i}"
        x2="${LABELS_WIDTH + (CHART_WIDTH / 22) * i}"
        y1="${Y_BUFFER}"
        y2="${Y_BUFFER + CHART_HEIGHT}"
        stroke="#000"
        stroke-opacity="0.1"
      />`;
    }
  })();

  /* 
    Add Ticks Values
  */
  (() => {
    for (let i = 0; i < 11; i++) {
      gridString += `<text
      x=${LABELS_WIDTH - 5}
      y=${(CHART_HEIGHT / 10) * i + Y_BUFFER}
      text-anchor="end"
      dominant-baseline="middle"
      font-size="12"
      >
      ${handleCurrencySymbol(currency)} ${humanReadableNumber(
        topRevenue - (topRevenue / 10) * i
      )}
    </text>`;
    }
  })();

  /* 
    Add Three Lines
  */
  (() => {
    linesString += `
     <g id="three_lines">
      <line
        x1=${LABELS_WIDTH}
        y1=${YValueToPixels(breakeven_data.fixed_cost)}
        x2=${LABELS_WIDTH + CHART_WIDTH}
        y2=${YValueToPixels(breakeven_data.fixed_cost)}
        stroke="#086972"
        stroke-width="4"
        id="fixed_cost_line"
      />
      <line
        x1=${LABELS_WIDTH}
        y1=${YValueToPixels(breakeven_data.fixed_cost)}
        x2=${LABELS_WIDTH + CHART_WIDTH}
        y2=${YValueToPixels(topTotalCost)}
        stroke="#E03131"
        stroke-width="4"
        id="total_cost_line"
      />
      <line
        x1=${LABELS_WIDTH}
        y1=${CHART_HEIGHT + Y_BUFFER}
        x2=${CHART_WIDTH + LABELS_WIDTH}
        y2=${Y_BUFFER}
        stroke="#2F9E44"
        stroke-width="4"
        id="revenue_line"
      />
     </g>
      `;
  })();

  /* 
    Add the points on lines
  */
  (() => {
    for (let i = 0; i < 22; i++) {
      linesString += `
      <circle
        cx=${LABELS_WIDTH + (i * CHART_WIDTH) / 21}
        cy=${Y_BUFFER + CHART_HEIGHT - (i * CHART_HEIGHT) / 21}
        r="4"
        fill="#2F9E44"
      />
        <circle
        cx=${LABELS_WIDTH + (CHART_WIDTH / 21) * i}
        cy=${YValueToPixels(breakeven_data.fixed_cost)}
        r="4"
        fill="#086972"
      />
      <circle
      cx=${LABELS_WIDTH + (CHART_WIDTH / 21) * i}
      cy=${YValueToPixels(
        breakeven_data.fixed_cost +
          ((topTotalCost - breakeven_data.fixed_cost) / 21) * i
      )}
      r="4"
      fill="#E03131"
      />
      `;
    }
  })();

  /* 
    Add the three numbers points
  */
  (() => {
    /* 
      Cost Line Point
    */
    const costLineX = LABELS_WIDTH + CHART_WIDTH / 2;
    const costLineY =
      breakeven_data.fixed_cost +
      ((topTotalCost - breakeven_data.fixed_cost) / 20) * 10;
    /* 
      Revenue Line Point
    */
    const revenueLineX = LABELS_WIDTH + CHART_WIDTH / 2;
    const revenueLineY = (topRevenue / 20) * 10;
    /* 
      Breakeven Point
    */

    threeNumbersPoints = `<g id="three_points" style="background: red;">
   <circle
      cx=${costLineX}
      cy=${YValueToPixels(costLineY)}
      transform="translate(0, 0)"
      r="6"
      fill="#fff"
      stroke="#ff0000"
      stroke-width="6"
    />
      <circle
      cx=${revenueLineX}
      cy=${YValueToPixels(revenueLineY)}
      transform="translate(0, 0)"
      r="6"
      fill="#fff"
      stroke="#2F9E44"
      stroke-width="6"
    />
   </g>`;
  })();

  /* 
  Add warning message if the data is pro-rata
*/
  if (breakeven_data.display_message) {
    warningMessage = `
     <div style="font-size:14px; font-weight:400; background: #FFF; box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.07); border-radius: 5px; color: #fd7e14; padding: 1em; margin: 0.5em 0; border: 1px solid #fd7e14; display: flex; align-items:center;">
        <span>
          <img src="https://break-even-pics.s3.eu-central-1.amazonaws.com/warning.png"></img>
        </span>
        <span style="margin-inline-start: 0.5em;">
          The cost and expenses for this account are calculated by
          pro-rata analysis
        </span>
      </div>
    `;
  }

  const htmlString = `
<html>
  <head>
    <title></title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: "DM Sans", sans-serif;
      }
      hr {
        border: 0.5px solid rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body>
  <div id="title" style="display: flex; gap: 8px; align-items: center;">
    <span style="font-size: 20px; font-weight: 700; line-height: 24px;">${title}</span>
    <span style="padding: 4px 12px; background: #F0F7F8; font-size: 18px; color: #086972; font-weight: 500; border-radius: 8px;">${account_name}</span>
  </div>
   <div id="header" style="display: flex; flex-direction: column; gap: 5px;">
        <span style="font-size: 18px; font-weight: 500; line-height: 24px;">${timeframe}</span>
    </div>
    ${warningMessage}
  <div style="display: flex; gap: 10px;">
    <div style="display: flex; flex-grow:1; flex-direction: column; gap: 10px;">
     
      <div id="legend" style="display: flex; justify-content: center; width: 100%;">
        <div style="display: inline-block; margin: 1em 3em;">
        <div style="display: inline-block; margin: 1em 3em;">
            <div style="width: 80px; border-radius: 2em; border-top: 5px solid #086972;"></div>
            <p style="font-size: 16px; font-weight: 500;">FIXED COSTS</p>
          </div>
        <div style="display: inline-block; margin: 1em 3em;">
            <div style="width: 80px; border-radius: 2em; border-top: 5px solid #e03131;"></div>
            <p style="font-size: 16px; font-weight: 500;">TOTAL COSTS</p>
          </div>
        <div style="display: inline-block; margin: 1em 3em;">
            <div style="width: 80px; border-radius: 2em; border-top: 5px solid #37b24d;"></div>
            <p style="font-size: 16px; font-weight: 500;">REVENUE</p>
          </div>
        </div>
      </div>
      <svg
          width=${SVG_WIDTH}
          height=${SVG_HEIGHT}
          preserveAspectRatio="xMidYMin"
        >
          ${gridString} 
          ${linesString}
          ${threeNumbersPoints}
        </svg>

      </div>
        <div style="width: 300px;">
          <div style="background: #FFF; box-shadow: 0px 0px 8px rgba(0,0,0,0.07); border-radius: 19px; padding: 28px; min-width: 300px;">
            <div  style="color: #37b24d;">
              <div style="font-size: 16px; font-weight: 400px; display: flex; align-items: center; gap: 0.5em;">
                <img
                src="https://break-even-pics.s3.eu-central-1.amazonaws.com/revenueellipse.png"
                width="15"
                height="15"
                />
               <span>Revenue</span>
              </div>
              <div style="font-size: 20px; font-weight: 500px;">
                ${formatCurrency(Math.round(breakeven_data.revenue), currency)}
              </div>
            </div>

            <hr style="margin-top: 20px;" />

            <div  style="color: #e03131">
              <div style="font-size: 16px; font-weight: 400px; display: flex; align-items: center; gap: 0.5em;">
                <img
                src="https://break-even-pics.s3.eu-central-1.amazonaws.com/totalcostellipse.png"
                  width="15"
                height="15"
                />
                <span>Total Cost</span>
              </div>
              <div style="font-size: 20px; font-weight: 500px;">
                ${formatCurrency(
                  Math.round(breakeven_data.total_cost),
                  currency
                )}
              </div>
            </div>

            <hr style="margin-top: 20px;" />

            <div  style="color: #1971c2">
              <div style="font-size: 16px; font-weight: 400px; display: flex; align-items: center; gap: 0.5em;">
                <img
                src="https://break-even-pics.s3.eu-central-1.amazonaws.com/breakdownellipse.png"
                  width="15"
                height="15"
                />
                <span>Breakeven</span>
              </div>
              <div style="font-size: 20px; font-weight: 500px;">
                ${formatCurrency(Math.round(breakeven), currency)}
              </div>
            </div>

            <hr style="margin-top: 20px;" />

            <div  style="color: #086972">
              <div style="font-size: 16px; font-weight: 400px; display: flex; align-items: center;">
                <img
                src="https://break-even-pics.s3.eu-central-1.amazonaws.com/fixedcostellipse.png"
                style="margin-inline-end: 0.5em"
                width="20"
                height="20"
                />
                Fixed cost
              </div>
              <div style="font-size: 20px; font-weight: 500px;">
                ${formatCurrency(
                  Math.round(breakeven_data.fixed_cost),
                  currency
                )}
              </div>
            </div>

            <hr style="margin-top: 20px;" />

            <div>
              <div style="font-size: 16px; font-weight: 400px;">
                Contribution margin
              </div>
              <div style="font-size: 20px; font-weight: 500px;">
                ${breakeven_data.contribution_margin.toFixed(2)} %
              </div>
            </div>

            <hr style="margin-top: 20px;" />

            <div>
              <div style="font-size: 16px; font-weight: 400px;">
                Margin of safety
              </div>
              <div style="font-size: 20px; font-weight: 500px;">
                ${formatCurrency(
                  Math.round(breakeven_data.margin_of_safety),
                  currency
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  </body>
</html>
`;

  try {
    const browser = await puppeteerBrowser.open();

    const page = await browser.newPage();

    page.setViewport({
      width: SVG_WIDTH + 300,
      height: SVG_HEIGHT + 300,
    });

    await page.setContent(htmlString);

    /*
    Get the element ref of the three lines group
  */
    const threeLinesref = await page.$("#three_lines");

    threeLinesref.evaluate(async (node) => {
      /* 
      Check if two points intersect
      has to be nested because of the evaluate function
    */
      const checkIntersection = (p1, p2) => {
        p1.x = Math.round(p1.x);
        p1.y = Math.round(p1.y);
        p2.x = Math.round(p2.x);
        p2.y = Math.round(p2.y);
        return p1.x === p2.x && p1.y === p2.y;
      };

      const costLine = node.children[1]; // get the cost line
      const revLine = node.children[2]; // get the revenue line

      const costLineLength = costLine.getTotalLength();
      const revLineLength = revLine.getTotalLength();

      for (let i = 0; i < revLineLength; i++) {
        const point = revLine?.getPointAtLength(i);

        /* 
        Check if the current revenue point 
        intersects with any of the cost points
      */
        for (let j = 0; j < costLineLength; j++) {
          if (checkIntersection(point, costLine?.getPointAtLength(j))) {
            /* 
            If the point intersects with any of the cost points
            then create a new point and append it to the svg
          */
            const newPoint = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            );
            newPoint.setAttribute("cx", point.x);
            newPoint.setAttribute("cy", point.y);
            newPoint.setAttribute("r", "6");
            newPoint.setAttribute("fill", "#1C7ED6");
            newPoint.setAttribute("transform", "translate(0, 0)");
            newPoint.setAttribute("id", "breakeven_point");
            newPoint.setAttribute("stroke", "#1C7ED6");
            newPoint.setAttribute("stroke-width", "6");

            const svgWrapper = document.querySelector("svg");
            svgWrapper.appendChild(newPoint);

            return;
          }
        }
      }
    });

    const b64string = await page.screenshot({
      encoding: "base64",
      optimizeForSpeed: true,
    });

    page.close();

    const bufferImage = Buffer.from(b64string, "base64");

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": bufferImage.length,
    });

    res.end(bufferImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBreakeven };
