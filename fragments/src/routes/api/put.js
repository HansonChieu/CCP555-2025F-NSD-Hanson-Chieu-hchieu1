// src/routes/api/put.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Check if the Content-Type matches
    const contentType = req.get('Content-Type');
    if (contentType !== fragment.type) {
      return res.status(400).json({
        status: 'error',
        error: `Content-Type mismatch. Expected ${fragment.type}, got ${contentType}`
      });
    }

    // Update the fragment data
    await fragment.setData(req.body);

    // Update the fragment metadata (updatedAt)
    // Note: You might need to add a method in your Fragment model to handle updating the 'updated' timestamp if save() doesn't do it automatically for existing records.
    fragment.updated = new Date().toISOString();
    await fragment.save();

    res.status(200).json({
      status: 'ok',
      fragment
    });
  } catch (error) {
    logger.error({ error }, 'Error updating fragment');
    res.status(404).json({ status: 'error', error: 'Fragment not found' });
  }
};