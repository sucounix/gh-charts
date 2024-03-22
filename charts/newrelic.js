"use strict";
const process = require("node:process");

require("dotenv").config();
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ["be-charts"],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: "info",
  },
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @name NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
      "response.headers.x*",
    ],
  },
  /**
   * Environment-specific settings.
   */
  development: {
    app_name: ["be-charts (Development)"],
    logging: {
      level: "info",
    },
    monitor_mode: true,
  },
  test: {
    app_name: ["be-charts (Test)"],
    logging: {
      level: "info",
    },
    monitor_mode: true,
  },
  staging: {
    app_name: ["be-charts (Staging)"],
    logging: {
      level: "info",
    },
    monitor_mode: true,
  },
  production: {
    app_name: ["be-charts (Production)"],
    logging: {
      level: "info",
    },
    monitor_mode: true,
  },
};
