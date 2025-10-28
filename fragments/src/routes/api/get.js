// src/routes/api/get.js
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  res.status(200).json({
    status: 'ok',
    // TODO: change me
    fragments: [],
  });
};

/**
 * Get a fragment by id (with optional conversion)
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse the id to check if it includes an extension
    const parts = id.split('.');
    let fragmentId = id;
    let requestedExt = null;
    
    if (parts.length > 1) {
      requestedExt = parts.pop();
      fragmentId = parts.join('.');
    }
    
    // Fetch the fragment
    const fragment = await Fragment.byId(req.user, fragmentId);
    
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    
    // Get the fragment data
    let data = await fragment.getData();
    let contentType = fragment.type;
    
    // Handle conversion if extension is specified
    if (requestedExt) {
      if (fragment.type === 'text/markdown' && requestedExt === 'html') {
        data = md.render(data.toString());
        contentType = 'text/html';
      } else if (!fragment.formats.includes(requestedExt)) {
        return res.status(415).json(
          createErrorResponse(415, 'Unsupported conversion type')
        );
      }
    }
    
    res.setHeader('Content-Type', contentType);
    res.status(200).send(data);
    
  } catch (error) {
    res.status(500).json(createErrorResponse(500, error.message));
  }
};