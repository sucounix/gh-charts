const Validator = require("validatorjs");
const currencies = require("../utils/currencies.json");

const breakevenValidator = (req, res, next) => {
  let data = req.body;

  let rules = {
    breakeven_data: {
      revenue: "required|numeric",
      total_cost: "required|numeric",
      fixed_cost: "required|numeric",
      contribution_margin: "required|numeric",
      margin_of_safety: "required|numeric",
      display_message: "boolean",
    },
    currency: ["required", { in: currencies.map((c) => c.code) }],
    title: "required|string",
    timeframe: "required|string",
    account_name: "required|string",
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
  breakevenValidator,
};
