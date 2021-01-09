const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;
const { getError, ValidationError, NotAuthorizedError } = require('../utils/errors');

const { ADMIN } = require('../utils/roles');
const { getValidAuthMethods, getRoutePermissions } = require('../../services/auth');

/**
 * Verify that the role and id associated with the token 
 * is allowed to access the attempted route
 */
const auth = async (req,res,next) => {

    try{
        // Get token from the header
        const token = parseAuthHeader(req.header('authorization'));
        const {id,role} = parseToken(token,signingKey);
        await verifyRouteOwnership(req.baseUrl,req.params.id,id,role);
        
        // Inject userId into req before proceeding
        req.auth = {id,role};
        next();
    }catch(err){
        next(await getError(err))
    }
}


/**
 * Extracts user token from Authorization header
 * @param {String} authHeader 
 */
function parseAuthHeader(authHeader) {

    const [authMethod,userToken] = authHeader
    ? authHeader.split(' ') 
    : ['',''];

    // ensure existence of auth method and token in correct format
    if (!userToken && !authMethod) throw new ValidationError('token')
    const methodIsValid = getValidAuthMethods().includes(authMethod.toLowerCase());
    if (!authMethod || !methodIsValid) throw new ValidationError('token','auth format not supported');
    if (!userToken) throw new ValidationError('token');

    return userToken;
}

/**
 * Verify the given token, and return owner's id, role
 * @param {String} userToken 
 * @param {String} signingKey 
 */
function parseToken(userToken,signingKey) {
    const token = njwt.verify(userToken,signingKey);
    const id = token.body.sub;
    const role = token.body.scope;
    return {id,role}
}

/**
 * Ensure that users can only access their own, or their childrens resources 
 * @param {String} baseUrl
 * @param {String} ownerId 
 * @param {String} id 
 * @param {String} role
 */
async function verifyRouteOwnership(baseUrl,ownerId,id,role) {

    // Allow admins unrestricted access
    if (role === ADMIN) return;

    // Check route permissions
    const modelMap = getRoutePermissions();
    const apiBaseString = baseUrl.split('/').pop();
    const model = modelMap[apiBaseString][0];
    const allowedRoles = modelMap[apiBaseString][1]
    if (!allowedRoles.has(role))
        throw new NotAuthorizedError('Restricted route');

    // If an id param is passed and the user is accessing their own data, allow access
    // if not, check if the user is accessing their childrens' data
    // If neither, throw unauthorized
    if  (ownerId && ownerId != id){
        if (isNaN(ownerId))
            throw new ValidationError('id parameter')

        let result;
        if (apiBaseString === 'distributors'){
            result = await model.findOne({where:{parentId:id,id:Number(ownerId)}})
        }else{
            result = await model.findOne({where:{distributorId:id,id:Number(ownerId)}}) 
        }
        if (!result) 
            throw new NotAuthorizedError('Private route');
    }
}

module.exports = auth;