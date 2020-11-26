
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

        let { phone } = req.body;
        // Check if phone number is given
        if (!phone){
            return res.status(400).json({
                error: "Please provide phone number"
            })
        }

        try{
            // Check if the user exists
            let result = await Login.findOne({where:{phone}});
            if (!result) {
                return res.status(400).json({
                    error: "Phone number is not registered"
                })
            } 
            
            // Generate random six-digit code
            const otpCode = getRandomCode(6);

            // store code to the databse
            Login.update({...result.dataValues,otpCode},{where:{phone}})
            
            //[TODO] send code via text
            console.log('OTP code for user: ', otpCode);

            // send code through the API
            return res.status(200).json({
                message: "OTP code has been sent!",
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
            const queryOptions = {where:email?{email}:{phone,code}}
            let result = await Login.findOne(queryOptions);
            if (!result)
                throw new NotAuthorizedError('')

            // Match password if logging in through email
            if (!phone){
                var { id, password:passwordHash, driverId, distributorId, userId } = result;

                if (!passwordHash) return res.status(400).json({error:"Password has not been set."})
                // Compare username/password combination
                const credentialsMatch = await bcrypt.compare(password,passwordHash);
                if (!credentialsMatch) return res.status(401).json({error:"Unauthorized"})
            } else{
                // Expire code if logged in using OTP code and phone number
                Login.update({...result,code:null,active:true},{where:{phone}})
            }

            // Get all roles for the user
            let roles = getRoles(result);

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