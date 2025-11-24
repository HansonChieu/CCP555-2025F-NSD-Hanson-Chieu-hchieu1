const express = require('express');
const { version, author } = require('../../package.json');
const router = express.Router();
const { authenticate } = require('../auth');

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({
    status: 'ok',
    author,
    version,
    githubUrl: 'https://github.com/HansonChieu/fragments.git',
  });
});


router.use(`/v1`, authenticate(), require('./api'));
router.use(`/v1`, require('./api'));

module.exports = router;