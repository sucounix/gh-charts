const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { handleNumberFormat } = require("../utils/handleNumberFormat");
const { hex2rgba } = require("../utils/hex2rgba");

const width = 800;
const height = 500;
const backgroundColour = "white";

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
  chartCallback: (ChartJS) => {
    ChartJS.register(require("chartjs-plugin-datalabels"));
  },
});

const getTrendAnalysis = async (req, res) => {
  const requestData = req.body;
  let currentChartYAxisUnitsType = [];
  let dataSetCharts = [];

  const handleChartYAxisUnitsType = () => {
    // the type can be one of 'Percentage' , 'Monetary' , 'Number' [check the validation schema]
    currentChartYAxisUnitsType = requestData.charts.reduce((x, y) => {
      (x[y.type] = x[y.type] || []).push(y);

      return x;
    }, {});
  };

  const prepareScaleAxes = () => {
    let scaleAxes = {
      x: {
        ticks: { beginAtZero: true },
      },
    };
    const scaleAxesProperties = {
      type: "linear",
      ticks: {
        beginAtZero: true,
        color: "rgba(55, 58, 64, 1)",
      },
      grid: { display: false },
    };

    Object.assign(scaleAxes, {
      left: {
        ...scaleAxesProperties,
        position: "left",
        ticks: {
          callback: function (value) {
            return handleNumberFormat(
              Object.keys(currentChartYAxisUnitsType)[0],
              value,
              requestData.currency,
            );
          },
        },
        grid: {
          color: "#ccc",
          borderDash: [8, 4],
        },
      },
    });

    if (Object.keys(currentChartYAxisUnitsType).length === 2) {
      Object.assign(scaleAxes, {
        right: {
          ...scaleAxesProperties,
          position: "right",
          ticks: {
            callback: function (value) {
              return handleNumberFormat(
                Object.keys(currentChartYAxisUnitsType)[1],
                value,
                requestData.currency,
              );
            },
          },
        },
      });
    }

    return scaleAxes;
  };

  const prepareData = () => {
    requestData.charts.map((chart) => {
      let standardValues = [],
        movingAvgValues = [];

      chart.values.map((value) => {
        standardValues.push(value.standard);
        if (chart.show_moving_average) {
          movingAvgValues.push(value.moving_average);
        }
      });

      addChartItem(chart, standardValues);

      if (chart.show_moving_average) {
        addChartItem(
          {
            ...chart,
            chart_name: `${chart.chart_name} moving avg`,
            color: hex2rgba(chart.color, 0.5), // returns: rgba(175,8,123,0.5)
          },
          movingAvgValues,
        );
      }
    });
  };

  const addChartItem = (chart, data) => {
    let chartItem = {
      label: chart.chart_name,
      data: data,
      type: chart.display_type,
      unitType: chart.type,
      borderWidth: 1,
      backgroundColor: chart.color,
      borderColor: chart.color,
      datalabels: {
        color: "rgba(55, 58, 64, 1)",
      },
    };
    chartItem.yAxisID =
      chart.type === Object.keys(currentChartYAxisUnitsType)[0]
        ? "left"
        : "right";

    dataSetCharts.push(chartItem);
  };

  handleChartYAxisUnitsType();
  prepareData();
  const scaleAxes = prepareScaleAxes();
  const configuration = {
    type: "",
    data: {
      labels: requestData.headers,
      datasets: dataSetCharts,
    },
    options: {
      responsive: true,
      scales: scaleAxes,
      layout: {
        padding: {
          top: 30,
          right: 20,
          left: 20,
        },
      },
      plugins: {
        datalabels: {
          align: "top",
          display: "auto",
          formatter: function (value, context) {
            return handleNumberFormat(
              context.chart.config.data.datasets[context.datasetIndex].unitType,
              value,
              requestData.currency,
            );
          },
          labels: {
            title: {
              font: {
                weight: "normal",
                size: "10px",
              },
            },
          },
        },
        title: {
          display: true,
          text: requestData.title,
          align: "start",
          color: "rgba(0, 0, 0, 1)",
          padding: {
            top: 10,
          },
        },
        subtitle: {
          display: true,
          text: requestData.timeframe,
          align: "start",
          color: "rgba(0, 0, 0, 1)",
          padding: {
            top: 10,
            bottom: 40,
          },
        },
        legend: {
          display: true,
          position: "bottom",
          padding: 10,
          labels: {
            color: "rgba(55, 58, 64, 1)",
          },
        },
      },
    },
  };

  try {
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": image.length,
    });
    res.end(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTrendAnalysis };
