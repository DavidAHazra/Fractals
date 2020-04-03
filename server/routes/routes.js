const express = require('express');
const path = require('path');


const router = express.Router();

router.use(require(path.join(__dirname, 'static_serve.js')));
router.use(require(path.join(__dirname, 'api.js')));

module.exports = router;