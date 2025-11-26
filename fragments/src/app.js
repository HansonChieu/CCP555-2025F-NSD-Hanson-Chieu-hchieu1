// src/app.js

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const compression = require('compression');
const logger = require('./logger');

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use CORS middleware so we can make requests across origins
app.use(cors({ 
  origin: '*',
  exposedHeaders: ['Location'],
}));

passport.use(require('./auth').strategy());
app.use(passport.initialize());

//Use gzip/deflate compression middleware
app.use(compression());

// Add body parsing middleware - IMPORTANT: Add this before routes!
// Parse all content types as raw Buffer data
app.use('/v1/fragments', express.raw({ 
  type: '*/*',  // Accept any content type
  limit: '5mb'  // Set size limit
}));

// You might also want these for other routes if needed:
// app.use(express.json()); // for application/json
// app.use(express.text({ type: 'text/*' })); // for text/* types

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json({ status: 'error', error: 'not found' });
});

app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) logger.error({ err }, `Error processing request`);
  res.status(status).json({ status: 'error', error: message });
});

// Export our `app` so we can access it in server.js
module.exports = app;