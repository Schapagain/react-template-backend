
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getAuthToken } = require('../../utils/auth');
const Login = require('../../models/Login');

// @route   POST api/auth
// @desc    Authenticate user
// @access  Public
router.post('/', async (req,res) => {

    let {email,password} = req.body;
    // Check if all fields are given
    if (!email || !password){
        return res.status(400).json({
            error: "Please provide all required fields"
        })
    }

    try{
        // Check if the user exists
        let result = await Login.findOne({where:{email}})
        if (!result) {
            return res.status(400).json({
                error: "Not authorized"
            })
        } 
        const { id, password:passwordHash, role } = result;

        // Compare username/password combination
        const credentialsMatch = await bcrypt.compare(password,passwordHash);
        if (!credentialsMatch) return res.status(401).json({error:"Unauthorized"})

        // Clean up User and assign token before sending the user back
        const token = getAuthToken(id, role);
        res.status(200).json({
            user: { id, email, role },
            token,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            error: 'Server error. Try again later.'
        })
    }
})

module.exports = router;