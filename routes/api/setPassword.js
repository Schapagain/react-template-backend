
const express = require('express');
const router = express.Router();
const { updatePassword } = require('../services/password');
const auth = require('../../middlewares/auth');
const validateNewPassword = require('../../middlewares/validateNewPassword');


// @route   POST api/set_password/:token
// @desc    Change user password
// @access  Public
router.patch('/:token',
    auth,
    validateNewPassword,
    async (req, res) => {
        const { id, password } = req.body;
        const result = await updatePassword(id,password);
        if (result){
            res.status(200).json({msg: "Password updated successfully"})
        }else{
            res.status(500).json({error:"Could not upadte password"})
        }
    });

module.exports = router;