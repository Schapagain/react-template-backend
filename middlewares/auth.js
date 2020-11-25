const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;
const { getError, ValidationError, NotAuthorizedError } = require('../utils/errors');

const { Distributor, Driver, User } = require('../models');
const { ADMIN } = require('../utils/roles');

// Acess controls based on roles remains to be implemented here
const auth = async (req,res,next) => {

    const modelMap = {
        'drivers' : Driver,
        'distributors' : Distributor,
        'users' : User,
    }

    try{
        // Get token from the header
        const userToken = req.header('authorization') || req.params.token;
        if (!userToken) return res.status(400).json({error:"No token found"})

        // Verify token and extract user id
        const token = njwt.verify(userToken,signingKey);
        const tokenId = token.body.sub;
        const tokenRole = token.body.scope;

        // Inject userId into req before proceeding
        req.auth = {
            id: tokenId,
            role: tokenRole
        }
        console.log('Request using token with id:',tokenId,'role:',tokenRole)
        if (tokenRole != ADMIN && req.params.id){
            if (isNaN(Number(req.params.id)))
                throw new ValidationError('id parameter')

            // Check for permission in case of private route
            const apiBaseString = req.baseUrl.split('/').pop();
            const model = modelMap[apiBaseString];
            let result;
            if (apiBaseString === 'distributors'){
                result = await model.findOne({where:{adminId:tokenId,id:req.params.id}})
            }else{
                result = await model.findOne({where:{distributorId:tokenId,id:req.params.id}}) 
            }
            if (!result && req.params.id !== tokenId) 
                throw new NotAuthorizedError('Private route');
        }
        next();
    }catch(err){
        next(await getError(err))
    }
}

module.exports = auth;