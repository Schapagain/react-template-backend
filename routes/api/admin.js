const express = require('express');
const router = express.Router();
const { getAuthToken } = require('../../utils/auth');

// @route   POST api/admin
// @desc    authenticate admin credentials
// @access  Public
router.post('/', 
    async (req, res) => {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({error: 'Please provide email and password'});
        }else{
            if (email === 'admin@admin.com' && password === 'password77'){
                const token = getAuthToken('123','admin');
                return res.status(200).json({token});
            }else{
                return res.status(401).json({error: 'Not authorized'});
            }
        }
    });

module.exports = router;