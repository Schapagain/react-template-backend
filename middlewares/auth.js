const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;
const { ADMIN } = require('../utils/roles');

// Acess controls based on roles remains to be implemented here
const auth = (req,res,next) => {
    try{
        // Get token from the header
        const userToken = req.header('authorization');
        if (!userToken) throw new Error("No token found");

        // Verify token and extract user id
        const token = njwt.verify(userToken,signingKey);
        const tokenId = token.body.sub;
        const tokenRole = token.body.scope;

        // Inject userId into req before proceeding
        req.id = tokenId;
        req.role = tokenRole;

        if (tokenRole !== ADMIN) {
            return res.status(401).json({error:'Not authorized'});
        }

        next();
    }catch(err){
        console.log(err.message);
        return res.status(401).json({
            error: err.message
        })
    }
}

module.exports = auth;