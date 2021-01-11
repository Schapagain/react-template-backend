require('dotenv').config();
const express = require('express');
const formParser = require('../../middlewares/formParser');
const router = express.Router();
const { getAuthToken } = require('../../controllers/auth');
const { ADMIN } = require('../../utils/roles');
const { Login } = require('../../database/models');

/**
 * Route to authenticate admin
 * @name    api/admin
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
*/
router.post('/', 
    formParser,
    async (req, res) => {
        const { password } = req.body;
        if(!password){
            return res.status(400).json({error: 'Please provide administrator password'});
        }else{
            const admin = await Login.findOne({where: {id: 1,password}})
            if (admin){
                const token = await getAuthToken(1,ADMIN);
                return res.status(200).json({token});
            }else{
                return res.status(401).json({error: 'Not authorized'});
            }
        }
    });

module.exports = router;