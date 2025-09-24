// src/app.js

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const compression = require('compression');

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use CORS middleware so we can make requests across origins
app.use(cors());

passport.use(require('./auth').strategy());
app.use(passport.initialize());

//Use gzip/deflate compression middleware
app.use(compression());

app.use('/', require('./routes'));

// Export our `app` so we can access it in server.js
module.exports = app;
