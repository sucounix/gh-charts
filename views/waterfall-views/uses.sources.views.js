const {
  handleCurrencySymbol,
  humanReadableNumber,
  formatCurrency,
} = require("../../utils/currency.utils");

const renderUsesAndSourcesView = (waterfallRequest) => {
  const waterfallData = waterfallRequest.waterfall_data.value.data;
  const labelsBlockWidth = 300;
  const chartWidth = 1200;
  const YSegmentHeight = 50;
  const XSegmentWidth = (chartWidth - labelsBlockWidth) / 6;
  const labelBlockHeight = 55;
  const fontSize = 15;
  const fontFamily = "DM sans";
  const tableBufferHeight = 60;
  let graphIntervals = [],
    graphInterval = 0,
    startX = 0,
    summaryData = {},
    shownTables = [],
    actualHeight = 0;

  const calculateXPoint = (value) => {
    return startX + XSegmentWidth * (value / graphInterval);
  };

  const calculateTextWidth = (number) => {
    let text = number?.toString();
    return (text?.length * fontSize * 2) / 3;
  };

  const determineTextPosition = (entry) => {
    if (entry.type === "total")
      return entry.XStart + 0.1 * calculateTextWidth(entry.value);
    if (entry.XStart > entry.XEnd) return entry.XStart + 10;
    if (entry.XEnd > 1300) return 1200;
    return entry.XEnd + 10;
  };

  let svgHTML = "";

  /* 
    Calculate Intervals
  */
  (() => {
    let max = 0;
    let min = 0;

    for (const row of waterfallData.rows.slice(0, 2)) {
      for (const subRow of row.row.rows) {
        const current =
          subRow.row[1].col_data === "-" ? 0 : subRow.row[1].col_data;
        max = Math.max(max, current);
        min = Math.min(min, current);
      }
    }

    const netChangeCashBalanceBlock = waterfallData.rows.find(
      (block) =>
        block.row.rows[0].row[0]?.col_data === "Net Change in Cash Flow",
    );
    if (netChangeCashBalanceBlock) {
      let current =
        netChangeCashBalanceBlock.row.rows[0].row[1].col_data === "-"
          ? 0
          : netChangeCashBalanceBlock.row.rows[0].row[1].col_data;
      if (current > max) max = current;
      if (current < min) min = current;
    }

    let interval;
    let intervals = [];

    if (Math.abs(max) > 4 * Math.abs(min)) {
      interval = (max * 1.2) / 4;
      const intervalRounded = Math.round(interval);

      if (Math.abs(intervalRounded) === 0) {
        graphInterval = 1;

        intervals.push(-1, 0, 1, 2, 3, 4);
      } else {
        graphInterval = intervalRounded;

        intervals.push(-intervalRounded);
        intervals.push(0);
        intervals.push(intervalRounded);
        intervals.push(intervalRounded * 2);
        intervals.push(intervalRounded * 3);
        intervals.push(intervalRounded * 4);
      }
    } else if (Math.abs(min) > 4 * Math.abs(max)) {
      interval = (min * 1.2) / 2;
      const intervalRounded = Math.round(interval);

      if (Math.abs(intervalRounded) === 0) {
        graphInterval = 1;

        intervals.push(-3, -2, -1, 0, 1, 2);
      } else {
        graphInterval = intervalRounded;

        intervals.push(intervalRounded * 3);
        intervals.push(intervalRounded * 2);
        intervals.push(intervalRounded);
        intervals.push(0);
        intervals.push(-intervalRounded);
        intervals.push(-intervalRounded * 2);
      }
    } else {
      const set = Math.max(Math.abs(max), Math.abs(min));
      interval = (set * 1.2) / 2;
      const intervalRounded = Math.round(interval);

      if (Math.abs(intervalRounded) === 0) {
        graphInterval = 1;

        intervals.push(-3, -2, -1, 0, 1, 2);
      } else {
        graphInterval = intervalRounded;

        intervals.push(-intervalRounded * 3);
        intervals.push(-intervalRounded * 2);
        intervals.push(-intervalRounded);
        intervals.push(0);
        intervals.push(intervalRounded);
        intervals.push(intervalRounded * 2);
      }
    }

    const indexOfZero = intervals.indexOf(0);

    startX = labelsBlockWidth + indexOfZero * XSegmentWidth;
    graphIntervals = intervals;
  })();

  /* 
    Render Intervals
  */
  (() => {
    for (let i = 0; i < graphIntervals.length; i++) {
      svgHTML += `
        <line
          x1=${labelsBlockWidth + i * XSegmentWidth}
          y1="90"
          x2=${labelsBlockWidth + i * XSegmentWidth}
          y2="100%"
          stroke="black"
        />
      <text
          x=${labelsBlockWidth + i * (XSegmentWidth + 2.5)}
          y="20"
          text-anchor="middle"
          style="font-size: 16px; font-weight: 500; font-family: ${fontFamily}; line-height: 24px; letter-spacing: -0.96px;"
        >
          ${
            graphIntervals[i] >= 0
              ? graphIntervals[i] === 0
                ? handleCurrencySymbol(waterfallRequest.currency) + " 0"
                : handleCurrencySymbol(waterfallRequest.currency) +
                  " " +
                  humanReadableNumber(graphIntervals[i])
              : "(" +
                handleCurrencySymbol(waterfallRequest.currency) +
                " " +
                humanReadableNumber(graphIntervals[i]) +
                ")"
          }
        </text>
        `;
    }
  })();

  /* 
    Handle Tables
*/
  (() => {
    const blocks = waterfallData.rows;
    let yPoint = 90;

    let usesOfCashBlock = blocks.find(
      (block) =>
        block.row.columns[0]?.col_data === "Uses Of Cash Flow (Spending)",
    );

    if (usesOfCashBlock)
      usesOfCashBlock = usesOfCashBlock.row?.rows?.map((row) => ({
        type: row.display_type,
        name: row.row[0].col_data,
        value: row.row[1].col_data,
      }));

    let sourcesOfCashBlock = blocks.find(
      (block) =>
        block.row.columns[0]?.col_data === "Sources Of Cash Flow (Generation)",
    );

    if (sourcesOfCashBlock)
      sourcesOfCashBlock = sourcesOfCashBlock.row?.rows?.map((row) => ({
        type: row.display_type,
        name: row.row[0].col_data,
        value: row.row[1].col_data,
      }));

    const netChangeCashBalanceBlock = blocks.find(
      (block) =>
        block.row.rows[0].row[0]?.col_data === "Net Change in Cash Flow",
    );

    let totalsBlocks = [netChangeCashBalanceBlock];

    let totalsBlock = [];

    totalsBlocks.forEach((block) => {
      if (block) {
        totalsBlock.push({
          type: block.row.rows[0].display_type,
          name: block.row.rows[0].row[0].col_data,
          value: block.row.rows[0].row[1].col_data,
        });
      }
    });

    // Determine which blocks do exist
    const availableBlocks = {
      usesOfCashBlock: usesOfCashBlock?.length > 0,
      sourcesOfCashBlock: sourcesOfCashBlock?.length > 0,
      totalsBlock: {
        netChangeCashBalanceBlock:
          netChangeCashBalanceBlock?.row?.rows?.length > 0,
      },
    };

    let preparedData = [];

    if (availableBlocks.usesOfCashBlock)
      preparedData.push({
        blockName: "Uses of Cash Flow (Spending)",
        children: [...usesOfCashBlock],
      });
    if (availableBlocks.sourcesOfCashBlock)
      preparedData.push({
        blockName: "Sources of Cash Flow (Generation)",
        children: [...sourcesOfCashBlock],
      });
    if (availableBlocks.totalsBlock)
      preparedData.push({
        blockName: "Totals",
        children: [...totalsBlock],
      });

    if (preparedData) {
      let tables = [];

      preparedData.forEach((block) => {
        tables.push({
          name: block.blockName,
          startY: yPoint,
          children: block.children,
        });
        yPoint =
          yPoint + YSegmentHeight * block.children.length + tableBufferHeight;
      });

      if (tables.length > 0) {
        for (let i = 0; i < tables.length; i++) {
          actualHeight +=
            YSegmentHeight * tables[i].children.length + tableBufferHeight;
        }
      }

      const beginCashBalanceBlock = blocks.find(
        (block) =>
          block.row.rows[0].row[0]?.col_data === "Beginning Cash Balance",
      );
      const endCashBalanceBlock = blocks.find(
        (block) => block.row.rows[0].row[0]?.col_data === "Ending Cash Balance",
      );

      summaryData = {
        uses: usesOfCashBlock?.at(-1)?.value,
        sources: sourcesOfCashBlock?.at(-1)?.value,
      };

      if (beginCashBalanceBlock) {
        summaryData.begin_cash =
          beginCashBalanceBlock?.row?.rows?.[0]?.row?.[1]?.col_data;
      }

      if (endCashBalanceBlock) {
        summaryData.ending_cash =
          endCashBalanceBlock?.row?.rows?.[0]?.row?.[1]?.col_data;
      }

      for (let i = 0; i < tables.length; i++) {
        let total = 0;
        let YPoint = tables[i].startY;

        tables[i].children.map((entry, index) => {
          let current = entry.value === "-" ? 0 : entry.value;
          total = total + current;
          entry.YPoint = YPoint + YSegmentHeight * index;
          entry.XStart =
            isNaN(calculateXPoint(total - current)) ||
            !isFinite(calculateXPoint(total - current))
              ? 0
              : calculateXPoint(total - current);
          entry.XEnd =
            isNaN(calculateXPoint(total)) || !isFinite(calculateXPoint(total))
              ? 0
              : calculateXPoint(total);
        });
      }

      shownTables = tables;
    }
  })();

  /* 
    Render Legend
  */
  (() => {
    svgHTML += `
      <g>
            <rect x="0" y="0" width="10" height="10" fill="#37B24D" rx="1" />
            <text x="15" y="9" style="font-size: 12px; font-weight: 500">
              Cash Recieved
            </text>

            <rect x="0" y="15" width="10" height="10" fill="#F03E3E" rx="1" />
            <text style="font-size: 12px; font-weight: 500" x="15" y="25">
              Cash Spent
            </text>
          </g>
    `;
  })();

  /* 
    render bars and labels
  */
  (() => {
    shownTables.forEach((table) => {
      table.children.forEach((entry) => {
        /* 
          Total Row Blue Background
        */
        if (entry.type === "total") {
          svgHTML += `
            <line
              x1="0"
              y1=${
                table.name === "Totals" ? entry.YPoint - 25 : entry.YPoint + 20
              }
              x2="100%"
              y2=${
                table.name === "Totals" ? entry.YPoint - 25 : entry.YPoint + 20
              }
              stroke="rgba(131, 180, 184, 0.15)"
              stroke-width="50"
            /> 
           `;
        }
        /* 
        Row Name
        */
        svgHTML += `
           <text
            width="30"
            x="10"
            y=${table.name === "Totals" ? entry.YPoint - 20 : entry.YPoint + 20}
            fill="black"
            style="font-size: 14px; line-height: 24px; letter-spacing: -0.84px;"
          >
            ${entry.name}
          </text>
        `;
        /* 
        Dashed line to bar
        */
        svgHTML += `
          <line
            stroke-dasharray="6"
            x1=${labelsBlockWidth}
            y1=${
              table.name === "Totals" ? entry.YPoint - 25 : entry.YPoint + 15
            }
            x2=${entry.XStart}
            y2=${
              table.name === "Totals" ? entry.YPoint - 25 : entry.YPoint + 15
            }
            stroke="black"
          />
        `;
        /* 
            Bars
        */
        svgHTML += `
            <line
              x1=${
                entry.type === "total"
                  ? startX
                  : Math.min(entry.XStart, entry.XEnd)
              }
              y1=${
                table.name === "Totals" ? entry.YPoint - 25 : entry.YPoint + 15
              }
              x2=${
                entry.type === "total"
                  ? entry.XStart
                  : Math.max(entry.XStart, entry.XEnd)
              }
              y2=${
                table.name === "Totals" ? entry.YPoint - 25 : entry.YPoint + 15
              }
              stroke=${
                entry.type === "total"
                  ? "#1C7ED6"
                  : entry.value > 0
                    ? "#37B24D"
                    : "#E03131"
              }
              stroke-width="30"
            />
            <text
              x=${determineTextPosition(entry)}
              y=${
                table.name === "Totals" ? entry.YPoint - 20 : entry.YPoint + 20
              }
              fill="black"
             style="font-size:16px; font-weight: 400; line-height: 24px; letter-spacing: -0.96px;"
            >
                ${
                  [0, "-"].includes(entry.value)
                    ? `${handleCurrencySymbol(waterfallRequest.currency)} 0.00`
                    : entry.value > 0
                      ? formatCurrency(
                          Math.abs(entry.value),
                          waterfallRequest.currency,
                        )
                      : "(" +
                        formatCurrency(
                          Math.abs(entry.value),
                          waterfallRequest.currency,
                        ) +
                        ")"
                }
            </text>
        `;

        if ([0, "-"].includes(entry.value)) {
          svgHTML += `
                 <line
                  x1=${entry.XStart}
                  y1=${entry.YPoint - 50}
                  x2=${entry.XStart}
                  y2=${entry.YPoint + 50}
                  stroke="white"
                />
                <line
                  x1=${entry.XStart}
                  y1=${entry.YPoint - 50}
                  x2=${entry.XStart}
                  y2=${entry.YPoint + 50}
                  stroke="black"
                  stroke-dasharray="2"
                />
        `;
        }
      });
    });
  })();

  /* 
    Render Headers
  */
  (() => {
    shownTables.forEach((table) => {
      if (table.name !== "Totals") {
        svgHTML += `
          <rect
            x="0"
            y=${table.startY - labelBlockHeight}
            width="100%"
            height="40"
            fill="white"
          />
          <line
            x1="0"
            y1=${table.startY - labelBlockHeight}
            x2="100%"
            y2=${table.startY - labelBlockHeight}
            stroke="black"
          />
          <text
            x="10"
            y=${table.startY - 25}
            style="font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: -0.96px;"
            fill="black"
          >
            ${table.name}
          </text>
          <line
            x1="0"
            y1=${table.startY - 10}
            x2="100%"
            y2=${table.startY - 10}
            stroke="black"
          />
        `;

        svgHTML += `
        <line
          x1="0"
          y1=${table.startY + table.children.length * YSegmentHeight}
          x2="100%"
          y2=${table.startY + table.children.length * YSegmentHeight}
          stroke="rgba(8, 105, 114, 0.4)"
          stroke-width="15"
        />
      `;
      } else {
        svgHTML += `
        <line
          x1="0"
          y1=${table.startY + YSegmentHeight * table.children.length - 48}
          x2="100%"
          y2=${table.startY + YSegmentHeight * table.children.length - 48}
          stroke="black"
          stroke-width="1"
        />
      `;
      }
    });
  })();

  return {
    svgHTML,
    summaryData,
    actualHeight,
  };
};

module.exports = {
  renderUsesAndSourcesView,
};
