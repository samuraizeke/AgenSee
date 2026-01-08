// Vercel Serverless Function entry point for Express API
// This imports the compiled Express app from the server dist folder

const app = require('../server/dist/index.js').default;

module.exports = app;
