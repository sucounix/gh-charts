const trendAnalysisDataValidator = (req, res, next) => {
  let data = req.body;
  let failsMsg = null;

  const calculateLengthChartYAxisUnitsTypeCheck = () => {
    // the type can be one of 'Percentage' , 'Monetary' , 'Number' [check the validation schema]
    // the max should be 2 types
    let currentChartYAxisUnitsType = data.charts.reduce((x, y) => {
      (x[y.type] = x[y.type] || []).push(y);

      return x;
    }, {});
    return Object.keys(currentChartYAxisUnitsType).length;
  };

  const isChartLengthEqualToHeader = () => {
    const isLengthEqual = data.charts.every((chart) => {
      return chart.values.length === data.headers.length;
    });
    return isLengthEqual;
  };

  if (calculateLengthChartYAxisUnitsTypeCheck() > 2) {
    failsMsg = "the unit should be max 2";
  } else if (!isChartLengthEqualToHeader()) {
    failsMsg = `Please check the length of the chart , it isn't align with the header length`;
  }

  if (failsMsg) {
    res.status(400).json({
      status: "error",
      message: "Invalid data",
      errors: failsMsg,
    });
  } else {
    next();
  }
};

module.exports = {
  trendAnalysisDataValidator,
};
