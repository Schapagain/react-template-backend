const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');

// @route   POST api/distributors
// @desc    Add a new distributor
// @access  Public
router.post('/', require('../services/distributors').postDistributor);

// @route   GET api/distributors
// @desc    View all distributors
// @access  Private
router.get('/', auth, require('../services/distributors').getDistributors);

module.exports = router;