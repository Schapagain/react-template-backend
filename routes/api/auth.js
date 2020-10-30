
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getAuthToken } = require('../../utils/authorization');
const auth = require('../../middlewares/auth');

// Import the user model
const User = require('../../models/user');
const { getCleanUsers } = require('../../utils/users');


// @route   POST api/auth
// @desc    Authenticate user
// @access  Public
router.post('/', async (req,res) => {

    let {email,password} = req.body;
    // Check if all fields are given
    if (!email || !password){
        return res.status(400).json({
            success: false,
            error: "Please provide all required user properties"
        })
    }

    try{
        // Check if the user already exists
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                error: "User doesn't exist"
            })
        } 

        // Compare username/password combination
        const credentialsMatch = await bcrypt.compare(password,user.password);
        if (!credentialsMatch) return res.status(401).json({error:"Unauthorized"})

        // Clean up User and assign token before sending the user back
        const token = getAuthToken(user.id);
        user = getCleanUsers(user).pop();
        res.status(200).json({
            user,
            token,
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            error: 'Could not add a new user. Try again later.'
        })
    }
})

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req,res) => {
    const {name,email} = await User.findById(req.id);
    res.status(200).json({name,email});
})

module.exports = router;