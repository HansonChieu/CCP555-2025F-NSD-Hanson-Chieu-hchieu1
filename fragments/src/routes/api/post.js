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
        error: 'Unsupported Media Type',
      });
    }

    // Get content type from header
    const contentTypeHeader = req.headers['content-type'];
    logger.debug(`Content-Type: ${contentTypeHeader}`);
    if (!Fragment.isSupportedType(contentTypeHeader)) {
      logger.warn(`Unsupported Media Type: ${contentTypeHeader}`);
      return res.status(415).json({
        status: 'error',
        error: 'Unsupported Media Type',
      });
    }

    // Create new fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentTypeHeader,
      size: req.body.length,
    });
    
    // Save the data
    await fragment.save();
    await fragment.setData(req.body);
    
    logger.info(`Fragment created successfully: ${fragment.id}`);
    
    // Build Location URL
    const apiUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
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
      error:  'Failed to create fragment',  
    });
  }
};