const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // Log the delete request
    logger.info(`Deleting fragment ${req.params.id} for user ${req.user}`);

    // Delete the fragment metadata and data
    await Fragment.delete(req.user, req.params.id);

    // Return success
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error({ error }, `Error deleting fragment ${req.params.id}`);
    res.status(404).json({ status: 'error', error: error.message });
  }
};