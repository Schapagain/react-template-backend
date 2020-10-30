
const express = require('express');
const router = express.Router();
const { updatePassword } = require('../services/password');
const validateSetPassword = require('../../middlewares/validateSetPassword');
const validateNewPassword = require('../../middlewares/validateNewPassword');


// @route   POST api/distributors/:id
// @desc    set distributor password
// @access  Public
router.patch('/:id', 
    validateSetPassword,
    validateNewPassword,
    async (req, res) => {
        const { id } = req.params;
        const { password } = req.body;
        const result = await updatePassword(id,password);
        if (result){
            res.status(200).json(result)
        }else{
            res.status(500).json({error:"Could not upadte password"})
        }
    });

module.exports = router;