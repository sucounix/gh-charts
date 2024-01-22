const Validator = require("validatorjs");
const currencies = require("../utils/currencies.json");

const trendAnalysisSchemaValidator = (req, res, next) => {
  let data = req.body;

  let rules = {
    headers: "required|array",
    currency: ["required", { in: currencies.map((c) => c.code) }],
    timeframe: "required|string",
    title: "required|string",
    charts: "required|array",
    "charts.*.chart_name": "required|string",
    "charts.*.display_type": "required|string|in:line,bar",
    "charts.*.type": "required|string|in:Percentage,Monetary,Number",
    "charts.*.color": "required|string",
    "charts.*.show_moving_average": "required|boolean",
    "charts.*.values": "required|array",
    "charts.*.values.*.standard": "required|numeric",
    "charts.*.values.*.moving_average": "required|numeric",
  };

  let validation = new Validator(data, rules);

  if (validation.fails()) {
    res.status(400).json({
      status: "error",
      message: "Invalid data",
      errors: validation.errors,
    });
  } else {
    next();
  }
};

module.exports = {
  trendAnalysisSchemaValidator,
};
