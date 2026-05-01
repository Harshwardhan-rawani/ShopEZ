const express = require('express');
const router = express.Router();
const { logInteraction } = require('../controllers/interactionController');
const auth = require('../middleware/auth');

router.post('/', auth, logInteraction);

module.exports = router;
