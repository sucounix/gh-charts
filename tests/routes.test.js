const request = require("supertest");
const app = require("../app");
const { describe, it, expect } = require("@jest/globals");

describe("GET /ping", () => {
  it("should respond with 'pong'", async () => {
    const response = await request(app).get("/ping");
    expect(response.status).toBe(200);
    expect(response.text).toBe("pong");
  });
});

describe("POST /breakeven", () => {
  // it("should respond with a breakeven point", async () => {
  //   const response = await request(app)
  //     .post("/breakeven")
  //     .send({
  //       breakeven_data: {
  //         revenue: 9731468.51,
  //         total_cost: 6783237.18,
  //         fixed_cost: 2579770.03,
  //         contribution_margin: 56.80541795227983,
  //         margin_of_safety: 5190053.055285502,
  //         display_message: true,
  //       },
  //       currency: "AED",
  //       title: "Test Title",
  //       timeframe: "Semi-Annual H2 2020",
  //       account_name: "Subscription",
  //     });
  //   expect(response.status).toBe(200);
  // });

  it("should respond with a 400 error if request body is invalid", async () => {
    const response = await request(app)
      .post("/breakeven")
      .send({ fixedCosts: "invalid", variableCosts: 50, price: 200 });
    expect(response.status).toBe(400);
  });
});

describe("POST /trend-analysis", () => {
  it("if the data is valid , should resond with status code 200", async () => {
    const response = await request(app)
      .post("/trend-analysis")
      .send({
        headers: ["Q1 2022"],
        currency: "EGP",
        title: "Performance Trend-line Chart",
        timeframe: "Semi Annual H2 2021",
        charts: [
          {
            chart_name: "cost of sales",
            display_type: "line",
            type: "Monetary",
            color: "#09c09c",
            show_moving_average: false,
            values: [
              {
                standard: 10,
                moving_average: 100,
              },
            ],
          },
        ],
      });
    expect(response.status).toBe(200);
  });

  it("if the header length not equal to the chart length , should resond with status code 400", async () => {
    const response = await request(app)
      .post("/trend-analysis")
      .send({
        headers: ["Q1 2022", "Q2 2022"],
        currency: "EGP",
        title: "Performance Trend-line Chart",
        timeframe: "Semi Annual H2 2021",
        charts: [
          {
            chart_name: "cost of sales",
            display_type: "line",
            type: "Monetary",
            color: "#09c09c",
            show_moving_average: false,
            values: [
              {
                standard: 10,
                moving_average: 100,
              },
            ],
          },
        ],
      });
    expect(response.status).toBe(400);
  });

  it("if their are more than 2 unit types, should resond with status code 400", async () => {
    const response = await request(app)
      .post("/trend-analysis")
      .send({
        headers: ["Q1 2022"],
        currency: "EGP",
        title: "Performance Trend-line Chart",
        timeframe: "Semi Annual H2 2021",
        charts: [
          {
            chart_name: "cost of sales",
            display_type: "line",
            type: "Monetary",
            color: "#09c09c",
            show_moving_average: false,
            values: [
              {
                standard: 10,
                moving_average: 100,
              },
            ],
          },
          {
            chart_name: "cost of sales",
            display_type: "line",
            type: "Percentage",
            color: "#09c09c",
            show_moving_average: false,
            values: [
              {
                standard: 10,
                moving_average: 100,
              },
            ],
          },
          {
            chart_name: "cost of sales",
            display_type: "line",
            type: "Number",
            color: "#09c09c",
            show_moving_average: false,
            values: [
              {
                standard: 10,
                moving_average: 100,
              },
            ],
          },
        ],
      });
    expect(response.status).toBe(400);
  });

  it("if the chart name is missing, should resond with status code 400", async () => {
    const response = await request(app)
      .post("/trend-analysis")
      .send({
        headers: ["Q1 2022"],
        currency: "EGP",
        timeframe: "Semi Annual H2 2021",
        charts: [
          {
            chart_name: "cost of sales",
            display_type: "line",
            type: "Monetary",
            color: "#09c09c",
            show_moving_average: false,
            values: [
              {
                standard: 10,
                moving_average: 100,
              },
            ],
          },
        ],
      });

    expect(response.status).toBe(400);
  });
});

describe("POST /waterfall", () => {
  // it("should respond with a waterfall chart", async () => {
  //   const response = await request(app)
  //     .post("/waterfall")
  //     .send({
  //       waterfall_data: {
  //         title: "Test Title",
  //         type: "waterfall",
  //         value: {
  //           data: {
  //             headers: ["Column 1", "Column 2", "Column 3"],
  //             rows: [
  //               ["Row 1", 100, 200],
  //               ["Row 2", 300, 400],
  //             ],
  //             columns: ["Column 1", "Column 2", "Column 3"],
  //           },
  //         },
  //         params: {
  //           view_name: "Net free cash flow",
  //         },
  //       },
  //       currency: "AED",
  //       timeframe: "Semi-Annual H2 2020",
  //     });
  //   expect(response.status).toBe(200);
  // });
  it("should respond with a 400 error if request body is invalid", async () => {
    const response = await request(app)
      .post("/waterfall")
      .send({
        waterfall_data: {
          title: "Test Title",
          type: "waterfall",
          params: {
            view_name: "Invalid View",
          },
        },
        currency: "AED",
        timeframe: "Semi-Annual H2 2020",
      });
    expect(response.status).toBe(400);
  });
});
