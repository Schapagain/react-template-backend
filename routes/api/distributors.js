const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const validateNewDistributor = require('../../middlewares/validateNewDistributor');
const prepareFilesystem = require('../../middlewares/fileSystem');
const formParser = require('../../middlewares/formParser');
const {postDistributor,getDistributors} = require('../services/distributors');

// @route   POST api/distributors
// @desc    Add a new distributor
// @access  Public
router.post('/', 
    formParser,
    validateNewDistributor,
    prepareFilesystem,
    (req, res, next) => {
        res.status(200).json({
            message: 'you good'
        })
        
    });

// @route   GET api/distributors
// @desc    View all distributors
// @access  Private
router.get('/', getDistributors);

module.exports = router;