const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;
const { getError, ValidationError, NotAuthorizedError } = require('../utils/errors');

const Distributor = require('../models/Distributor');

// Acess controls based on roles remains to be implemented here
const auth = async (req,res,next) => {
    try{
        // Get token from the header
        const userToken = req.header('authorization') || req.params.token;
        if (!userToken) return res.status(400).json({error:"No token found"})

        // Verify token and extract user id
        const token = njwt.verify(userToken,signingKey);
        const tokenId = token.body.sub;
        const tokenRole = token.body.scope;

        // Inject userId into req before proceeding
        req.body.id = tokenId;
        req.body.role = tokenRole;

        if (req.params.id){
            if (isNaN(Number(req.params.id)))
                throw new ValidationError('id parameter')
            const result = await Distributor.findOne({where:{adminId:tokenId,id:req.params.id}})
            if (!result && req.params.id !== tokenId) 
                throw new NotAuthorizedError('');
        }
        next();
    }catch(err){
        next(await getError(err))
    }
}

module.exports = auth;