const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;

// This also needs to account for role of the user
const getAuthToken = (id,role) => {
    const claims = {
      sub: id,
      scope: role,
    }
    const token = njwt.create(claims,signingKey);
    token.setExpiration(new Date().getTime() + (7*86400*1000));
    return token.compact();
}

module.exports = {getAuthToken};