require('dotenv').config();
const express = require('express');
const router = express.Router();
const { getAuthToken } = require('../../utils/auth');
const { ADMIN } = require('../../utils/roles');
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ID } = process.env;

/**
 * Route to authenticate admin
 * @name    api/admin
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/', 
    async (req, res) => {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({error: 'Please provide email and password'});
        }else{
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD){
                const token = getAuthToken(ADMIN_ID,ADMIN);
                return res.status(200).json({token});
            }else{
                return res.status(401).json({error: 'Not authorized'});
            }
        }
    });

module.exports = router;