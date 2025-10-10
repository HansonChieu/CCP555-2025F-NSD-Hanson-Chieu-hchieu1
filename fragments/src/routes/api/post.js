// src/routes/api/post.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * POST /v1/fragments
 * Create a new fragment for the authenticated user
 */
module.exports = async (req, res) => {
  try {
    logger.info('POST /v1/fragments - Creating new fragment');
    
    // Check if body was parsed correctly as a Buffer
    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Unsupported Media Type received');
      return res.status(415).json({ 
        status: 'error',
        error: { message: 'Unsupported Media Type' } 
      });
    }

    // Get content type from header
    const contentTypeHeader = req.headers['content-type'];
    logger.debug(`Content-Type: ${contentTypeHeader}`);
    
    // Create new fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentTypeHeader,
    });
    
    // Save the data
    await fragment.setData(req.body);
    
    logger.info(`Fragment created successfully: ${fragment.id}`);
    
    // Build Location URL
    const apiUrl = process.env.API_URL || `http://${req.headers.host}`;
    const location = `${apiUrl}/v1/fragments/${fragment.id}`;
    
    // Send response
    res.setHeader('Location', location);
    res.status(201).json({
      status: 'ok',
      fragment: {
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created,
        updated: fragment.updated,
        type: fragment.type,
        size: fragment.size,
      },
    });
    
  } catch (error) {
    logger.error('Error creating fragment:', error);
    res.status(500).json({ 
      status: 'error',
      error: { message: 'Failed to create fragment' } 
    });
  }
};