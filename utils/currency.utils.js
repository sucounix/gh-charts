const currencies = require("./currencies.json");
const hrn = require("hrn");

const handleCurrencySymbol = (code) => {
  let targetCurrency = currencies.find((currency) => currency.code === code);
  return targetCurrency.symbol;
};

const handleCurrencyPrecision = (code) => {
  let targetCurrency = currencies.find((currency) => currency.code === code);
  return targetCurrency.decimalDigits;
};

const humanReadableNumber = (number) => {
  return `${hrn(number, 2, ["KMBTPEZY".split(""), 1e3])}`;
};

const formatCurrency = (number, currencyCode) => {
  if (number === null || number === 0 || number === "-") return "-";
  if (number < 0)
    return `(${handleCurrencySymbol(currencyCode)} ${new Intl.NumberFormat(
      `en`,
      {
        maximumFractionDigits: handleCurrencyPrecision(currencyCode),
        minimumFractionDigits: handleCurrencyPrecision(currencyCode),
        currencySign: "accounting",
      },
    ).format(Math.abs(number))})`;
  return `${handleCurrencySymbol(currencyCode)} ${new Intl.NumberFormat(`en`, {
    maximumFractionDigits: handleCurrencyPrecision(currencyCode),
    minimumFractionDigits: handleCurrencyPrecision(currencyCode),
    currencySign: "accounting",
  }).format(number)}`;
};

module.exports = {
  handleCurrencySymbol,
  handleCurrencyPrecision,
  humanReadableNumber,
  formatCurrency,
};
