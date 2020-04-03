const express = require('express');
const path = require('path');

const router = express.Router();

// Default paths
const build_dir = path.join(__dirname, '..', '..', 'client', 'build');

router.get('/favicon.ico', (req, res) => res.sendFile(path.join(build_dir, 'favicon.ico')));
router.get('/manifest.json', (req, res) => res.sendFile(path.join(build_dir, 'manifest.json')));
router.get('/static/*', (req, res) => res.sendFile(path.join(build_dir, req.originalUrl)));
router.get('/shaders/*', (req, res) => res.sendFile(path.join(build_dir, req.originalUrl)));


// React Routes
function forward_to_react(req, res) {
    res.sendFile(path.join(build_dir, 'index.html'));
}

['/'].forEach(route => router.get(route, (req, res) => forward_to_react(req, res)));

module.exports = router;