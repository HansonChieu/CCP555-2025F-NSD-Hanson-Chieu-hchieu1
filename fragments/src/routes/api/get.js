// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const md = require('markdown-it')();
const path = require('path'); 

/**
 * Get a list of fragments for the current user
 */
module.exports.getAll = async (req, res) => {
  try {
    // Check if we should expand the fragments to include full metadata
    const expand = req.query.expand === '1';
    
    // Fetch fragments for the authenticated user
    const fragments = await Fragment.byUser(req.user, expand);
    
    res.status(200).json({
      status: 'ok',
      fragments,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

/**
 * Get a specific fragment's metadata (no data)
 */
module.exports.getInfo = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    res.status(200).json({
      status: 'ok',
      fragment,
    });
  } catch (error) {
    logger.error(error);
    res.status(404).json({ status: 'error', error: 'Fragment not found' });
  }
};

/**
 * Get a fragment by id (with optional conversion)
 */
module.exports.getById = async (req, res) => {
  try {
    // Use path.parse to safely separate the ID and the extension
    // e.g., "1234.html" -> name="1234", ext=".html"
    const { name: id, ext } = path.parse(req.params.id);
    
    // Fetch the fragment by the ID (without extension)
    const fragment = await Fragment.byId(req.user, id);
    
    // Get the raw content (Buffer)
    const data = await fragment.getData();
    
    // If an extension was provided, we might need to convert
    if (ext) {
      // 1. Handle Markdown -> HTML conversion
      if (fragment.type === 'text/markdown' && ext === '.html') {
        const html = md.render(data.toString());
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      }

      // 2. If the extension matches the current type (e.g. .json for application/json), just return it
      // We check if the requested extension maps to the fragment's mime type
      // (This logic can be expanded in Assignment 3)

      const extToType = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.html': 'text/html',
        '.json': 'application/json'
      };
  
      if (extToType[ext] === fragment.mimeType) {
        res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
      }

      
      // If we don't support the conversion, return 415
      return res.status(415).json({ 
        status: 'error', 
        error: `Conversion to ${ext} not supported` 
      });
    }

    // No extension provided: serve the raw data with original content type
    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Content-Length', fragment.size);
    res.status(200).send(data);
    
  } catch (error) {
    logger.error(error);
    res.status(404).json({ status: 'error', error: 'Fragment not found' });
  }
};