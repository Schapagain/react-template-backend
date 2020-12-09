const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;
const { getError, ValidationError, NotAuthorizedError } = require('../utils/errors');

const { Distributor, Driver, User, Vehicle, Country, Package, Contact, Subscription } = require('../models');
const { ADMIN, DISTRIBUTOR, DRIVER } = require('../utils/roles');

// Acess controls based on roles remains to be implemented here
const auth = async (req,res,next) => {

    const modelMap = {
        'drivers' : [Driver,new Set([ADMIN,DISTRIBUTOR])],
        'distributors' : [Distributor,new Set([ADMIN,DISTRIBUTOR])],
        'users' : [User,new Set([ADMIN,DISTRIBUTOR])],
        'vehicles' : [Vehicle,new Set([ADMIN,DRIVER,DISTRIBUTOR])],
        'countries' : [Country,new Set([ADMIN])],
        'states' : [Country,new Set([ADMIN])],
        'districts' : [Country,new Set([ADMIN])],
        'municipalities' : [Country,new Set([ADMIN])],
        'localities' : [Country,new Set([ADMIN])],
        'wards' : [Country,new Set([ADMIN])],
        'packages' : [Package,new Set([ADMIN,DISTRIBUTOR])],
        'contacts' : [Contact, new Set([ADMIN,DISTRIBUTOR])],
        'subscriptions':[Subscription, new Set([ADMIN,DISTRIBUTOR])],
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

        // [LOG] 
        console.log('Request using token with id:',tokenId,'role:',tokenRole)

        // Check route permissions
        const apiBaseString = req.baseUrl.split('/').pop();
        const model = modelMap[apiBaseString][0];
        const allowedRoles = modelMap[apiBaseString][1]
        if (!allowedRoles.has(tokenRole))
            throw new NotAuthorizedError('Restricted route');

        // Allow admins unrestricted access
        // If an id param is passed and the user is accessing their own data, allow access
        // if not, check if the user is accessing their childrens' data
        // If neither, throw unauthorized
        if (tokenRole != ADMIN && req.params.id && req.params.id != tokenId){
            if (isNaN(req.params.id))
                throw new ValidationError('id parameter')

            let result;
            if (apiBaseString === 'distributors'){
                result = await model.findOne({where:{parentId:tokenId,id:Number(req.params.id)}})
            }else{
                result = await model.findOne({where:{distributorId:tokenId,id:Number(req.params.id)}}) 
            }
            if (!result) 
                throw new NotAuthorizedError('Private route');
        }
        next();
    }catch(err){
        next(await getError(err))
    }
}

module.exports = auth;