const Validator = require("validatorjs");
const currencies = require("../utils/currencies.json");

const waterfallValidator = (req, res, next) => {
  let data = req.body;

  let rules = {
    waterfall_data: {
      title: "required|string",
      type: ["required", "string", "in:waterfall"],
      value: {
        data: {
          headers: ["required"],
          rows: ["required", "array"],
          columns: ["required", "array"],
        },
      },
      params: {
        view_name: [
          "required",
          "string",
          {
            in: [
              "Cash Flow (CFO - CFI - CFF)",
              "Uses & Sources of Cash Flow",
              "Net free cash flow",
            ],
          },
        ],
      },
    },
    currency: ["required", { in: currencies.map((c) => c.code) }],
    timeframe: "required|string",
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
  waterfallValidator,
};
