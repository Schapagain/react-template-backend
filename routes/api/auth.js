
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getAuthToken } = require('../../utils/auth');
const { getRandomCode, getRoles } = require('../../utils');
const { Login } = require('../../models');
const formParser = require('../../middlewares/formParser');
const { getError, NotAuthorizedError } = require('../../utils/errors');
const { DRIVER, DISTRIBUTOR, USER } = require('../../utils/roles');
const distributors = require('../../services/distributors');
const { sendOTP } = require('../../services/password');

/**
 * Route to get login code using phone number
 * @name    api/auth/get_code
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/get_code', 
    formParser,
    async (req,res) => {

        let { phone, distributorId } = req.body;

        try{
            await sendOTP(distributorId,phone);

            // send code through the API
            return res.status(200).json({
                message: "If phone is registered, an OTP code has been sent!",
            })
        }
        catch(err){
            err = await getError(err)
            return res.status(err.httpCode || 500).json({error: err.message})
        }
    }
)

/**
 * Route to authenticate a suer
 * @name    api/auth
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/', 
    formParser,
    async (req,res) => {

        let { email, password, phone, code } = req.body;
        // Check if all fields are given
        if (!((email  && password) || (phone && code))){
            return res.status(400).json({
                error: "Please provide email/password or phone/code"
            })
        }

        try{
            // Check if the user exists
            const queryOptions = {where:email?{email}:{phone,otpCode:code}}
            let result = await Login.findOne(queryOptions);
            if (!result)
                throw new NotAuthorizedError('')

            let { id, password:passwordHash, driverId, distributorId, userId } = result;
            // Match password if logging in through email
            if (!phone){
                // if logging in through email, remove the driver role
                delete result.driverId;
                
                if (!passwordHash) return res.status(400).json({error:"Password has not been set."})
                // Compare username/password combination
                const credentialsMatch = await bcrypt.compare(password,passwordHash);
                if (!credentialsMatch) return res.status(401).json({error:"Unauthorized"})
            } else{
                // Expire code if logged in using OTP code and phone number
                Login.update({...result,otpCode:null,active:true},{where:{phone}})
            }

            // Get all roles for the user
            let roles = getRoles(result);

            // set id to appropriate model id
            id = distributorId || driverId || userId;

            const user = phone? { id, phone, roles } : { id, email, roles }
            const token = getAuthToken(id, roles[0]);
            res.status(200).json({
                token,
                user,
            })
        }
        catch(err){
            err = await getError(err)
            return res.status(err.httpCode || 500).json({error: err.message})
        }
    }
)

module.exports = router;