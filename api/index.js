const serverless = require('serverless-http');

// Import the Express app (not the server with Socket.IO)
const app = require('../backend/app');

// Ensure the app is properly configured for serverless
const handler = serverless(app, {
  binary: false,
  request: (request, event, context) => {
    // Add any serverless-specific request processing
    request.serverless = true;
  },
  response: (response, event, context) => {
    // Add any serverless-specific response processing
  }
});

module.exports = handler;