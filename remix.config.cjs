/* global process */

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // Specifies the build target as Vercel
  serverBuildTarget: 'vercel',

  // Adjust the server file used in production
  server: process.env.NODE_ENV === "development" ? undefined : undefined, // Remove custom server file

  // Additional configuration options
  ignoredRouteFiles: ["**/.*", "**/*.test.{ts,tsx}"],
  cacheDirectory: "./node_modules/.cache/remix",
};
