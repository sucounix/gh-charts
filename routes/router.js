const router = require("express").Router();
const { getBreakeven } = require("../controllers/breakeven.controller");
const { getWaterfall } = require("../controllers/waterfall.controller");
const { breakevenValidator } = require("../validators/breakeven.validator");
const { waterfallValidator } = require("../validators/waterfall.validator");
const {
  getTrendAnalysis,
} = require("../controllers/trend-analysis.controller");
const {
  trendAnalysisSchemaValidator,
} = require("../validators/trend-analysis-schema.validator");
const {
  trendAnalysisDataValidator,
} = require("../validators/trend-analysis-data.validator");

router.get("/ping", (_, res) => {
  res.send("pong");
});

router.post("/breakeven", breakevenValidator, getBreakeven);
router.post("/waterfall", waterfallValidator, getWaterfall);
router.post(
  "/trend-analysis",
  trendAnalysisSchemaValidator,
  trendAnalysisDataValidator,
  getTrendAnalysis,
);

module.exports = router;
