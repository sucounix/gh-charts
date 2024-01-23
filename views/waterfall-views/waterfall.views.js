const { formatCurrency } = require("../../utils/currency.utils");
const { renderCFOView } = require("./cfo-cfi-cff.view");
const { renderUsesAndSourcesView } = require("./uses.sources.views");
const { renderNetFreeCashView } = require("./netfree.views");

const summaryTitles = {
  cash_from_operations: "Cash flow from operations",
  cash_from_investing: "Cash flow from investment",
  cash_from_financing: "Cash flow from financing",
  net_change_in_cash: "Net Change in Cash",
  begin_cash: "Beginning cash balance",
  ending_cash: "Ending cash balance",
  sources: "Sources of Cash Flow (Generation)",
  uses: "Uses of Cash Flow (Spending)",
  freeEquity: "Free Cash Flow To Equity",
};

const renderWaterfallHTML = (waterfallRequest) => {
  const viewName = waterfallRequest.waterfall_data.params.view_name;
  let viewResponse,
    chartHTML = "";

  switch (viewName) {
    case "Cash Flow (CFO - CFI - CFF)":
      viewResponse = renderCFOView(waterfallRequest);
      break;
    case "Uses & Sources of Cash Flow":
      viewResponse = renderUsesAndSourcesView(waterfallRequest);
      break;
    case "Net free cash flow":
      viewResponse = renderNetFreeCashView(waterfallRequest);
      break;
    default:
      viewResponse = renderCFOView(waterfallRequest);
      break;
  }

  const { svgHTML, actualHeight, summaryData } = viewResponse;

  /* 
    Add Header Title and Timeframe 
  */
  (() => {
    chartHTML += `
      <div style="margin-bottom: 2rem;">
        <div id="title" style="display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 20px; font-weight: 700; line-height: 24px;">${waterfallRequest.waterfall_data.title}</span>
        </div>
        <div id="header" style="display: flex; flex-direction: column; gap: 5px;">
          <span style="font-size: 18px; font-weight: 500; line-height: 24px;">${waterfallRequest.timeframe}</span>
        </div>
      </div>
    `;
  })();

  /* 
    Add Top Cards Summary
  */
  (() => {
    chartHTML += `<div style="display: flex; width: 100%; margin: 1rem 0 2rem 0rem; gap: 1rem;">`;

    Object.entries(summaryData).forEach(([key, value]) => {
      chartHTML += `
       <div style="display: flex; margin: 1rem 0 2rem 0rem; gap: 1rem; width: 100%; max-width: 25%">
          <div style="background: #ffffff;box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.07);border-radius: 10px;display: flex;flex-direction: column;padding: 18px;text-align: start;gap: 8px; width:100%;">
            <span style="font-size: 16px; font-weight:400; color: #086972;">
              ${summaryTitles[key]}
            </span>
              ${
                value > 0
                  ? `<span
                style="font-weight: 700; font-size: 24px; line-height: 24px; color: #37B24D;">`
                  : `<span
                style="font-weight: 700; font-size: 24px; line-height: 24px; color: #F03E3E;">`
              }
            ${
              value > 0
                ? formatCurrency(value, waterfallRequest.currency)
                : `(${formatCurrency(
                    Math.abs(value),
                    waterfallRequest.currency,
                  )})`
            }
                </span>
              </span>
            </div>
          </div>
      `;
    });

    chartHTML += `</div>`;
  })();

  chartHTML += ` 
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height=${actualHeight}>
      ${svgHTML}
    </svg>
  </div>`;

  return {
    chartHTML,
    actualHeight,
  };
};

module.exports = {
  renderWaterfallHTML,
};
