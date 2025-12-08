// src/routes/api/index.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const fragmentGet = require('./get'); // Import the whole module
const fragmentPost = require('./post');
const fragmentDelete = require('./delete');

const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// GET /fragments (List)
router.get('/fragments', fragmentGet.getAll);

// GET /fragments/:id/info (Metadata only)
router.get('/fragments/:id/info', fragmentGet.getInfo);

// GET /fragments/:id (Data with optional conversion)
router.get('/fragments/:id', fragmentGet.getById);

// POST /fragments
router.post('/fragments', rawBody(), fragmentPost);

// DELETE /fragments/:id
router.delete('/fragments/:id', fragmentDelete);

module.exports = router;