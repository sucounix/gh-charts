const { humanReadableNumber } = require("./humanReadableNumber");

const handleNumberFormat = (unitType, value, currency) => {
  const formattedValue = humanReadableNumber(Math.abs(value));
  if (unitType === "Percentage") return `${formattedValue} %`;
  else if (unitType === "Monetary") return `${currency} ${formattedValue}`;
  else return formattedValue;
};

module.exports = { handleNumberFormat };
