// src/routes/api/post.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.info('POST /v1/fragments - Creating new fragment');

    // Ensure request body is a Buffer
    let data = req.body;
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(req.body);
    }

    // Normalize the Content-Type header
    const contentTypeHeader = req.get('Content-Type')?.split(';')[0].trim();
    if (!contentTypeHeader) return res.status(400).json({ error: 'Content-Type required' });
    logger.debug(`Content-Type: ${contentTypeHeader}`);

    if (!Fragment.isSupportedType(contentTypeHeader)) {
      return res.status(415).json({
        status: 'error',
        error: 'Unsupported Media Type',
      });
    }

    // Create the fragment metadata
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentTypeHeader,
      size: data.length,
    });

    // Save the fragment data
    await fragment.save();
    logger.debug(`Saved Fragment ID: ${fragment.id}`);
    await fragment.setData(data);

    const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    const location = `${apiUrl}/v1/fragments/${fragment.id}`;

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
  } catch (err) {
    logger.error('Error creating fragment:', err);
    res.status(500).json({
      status: 'error',
      error: 'Failed to create fragment',
    });
  }
};
