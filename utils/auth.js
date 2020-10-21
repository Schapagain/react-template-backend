const njwt = require('njwt');
require('dotenv').config();
const signingKey = process.env.SECRET_KEY;

// This also needs to account for role of the user
const getAuthToken = id => {
    const claims = {
      sub: id,
    }
    const token = njwt.create(claims,signingKey);
    token.setExpiration(new Date().getTime() + (60*60*1000));
    return token.compact();
}

module.exports = {getAuthToken};