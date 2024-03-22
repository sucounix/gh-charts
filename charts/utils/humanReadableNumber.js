const hrn = require("hrn");

const humanReadableNumber = (number) => {
  return `${hrn(number, 2, ["KMBTPEZY".split(""), 1e3])}`;
};

module.exports = { humanReadableNumber };
