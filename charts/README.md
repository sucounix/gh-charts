ExpressJS Chart Image Generation Server

Overview

This ExpressJS server is designed to generate chart images from data sent by incoming HTTP requests and return them to another microservice.

Prerequisites

Before you can run this server, make sure you have the following prerequisites installed:

- Node.js (v14 or higher)
- npm (usually comes with Node.js)
- Express (already included in the project)

Installation

Clone the repository to your local machine:

```
git clone git@bitbucket.org:femtofpa/chart.git
```

Change directory to the project folder:

```
cd charts
```

Install the required dependencies:

```
npm install
```

Configuration

You may need to configure the server based on your requirements.

PORT: The port on which the server will listen for incoming requests. It should be be included in .env file or else :80 will be used.

Usage

Start the server by running the following command:

```
npm run dev
```

This will start the Express server on the configured port (default is 80).
Send HTTP POST requests to the server with the data you want to use for chart generation. Make sure to include the data in the request body in the required format.

Example request:

```

POST http://localhost:80/breakeven
Content-Type: application/json

{
  "breakeven_data": {
        "revenue": 9731468.51,
        "total_cost": 6783237.18,
        "fixed_cost": 2579770.03,
        "contribution_margin": 56.80541795227983,
        "margin_of_safety": 5190053.055285502,
        "display_message": true
    },
    "currency": "AED",
    "title": "Test Title",
    "timeframe": "Semi-Annual H2 2020",
    "account_name": "Subscription"
}
```

POST /breakeven: Generates a chart image based on the provided data and returns it in the response.
