/* global process */

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // Specifies the build target as Vercel
  serverBuildTarget: 'vercel',
  
  // Adjust the server file used in production
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",

  // Add any additional configuration options your app requires
  ignoredRouteFiles: ["**/.*", "**/*.test.{ts,tsx}"],

  cacheDirectory: "./node_modules/.cache/remix",
};
