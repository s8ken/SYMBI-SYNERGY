const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat.controller');
const { createTrustMiddleware } = require('../core/trustOracle');

router.post('/send', createTrustMiddleware(), controller.sendMessage);

module.exports = router;