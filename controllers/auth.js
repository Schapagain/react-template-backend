const { User, Image, Album } = require("../database/models");
const njwt = require("njwt");
const { getError, NotAuthorizedError } = require("../utils/errors");
const { USER, ADMIN, DISTRIBUTOR } = require("../utils/roles");
const { checkLoginPresence } = require("./users");
require("dotenv").config();
const signingKey = process.env.SECRET_KEY;

/**
 * Return accepted token authorization methods
 */
function getValidAuthMethods() {
  return ["bearer"];
}

/**
 * Return mappings from routes to [userModel,allowed roles]
 * Usermodel is the model associated with the route
 */
function getRoutePermissions() {
  const routePermissionsMap = {
    users: [User, new Set([ADMIN, USER])],
    images: [Image, new Set([ADMIN, USER])],
    albums: [Album, new Set([ADMIN, USER])],
  };
  return routePermissionsMap;
}

/**
 * return a JWT token with encoded id and role.
 * @param {String} id
 * @param {String} role
 */
const getAuthToken = async (id, role) => {
  const claims = {
    sub: id,
    scope: role,
  };
  try {
    const token = njwt.create(claims, signingKey);
    token.setExpiration(new Date().getTime() + 7 * 86400 * 1000);
    return token.compact();
  } catch (err) {
    throw await getError(err);
  }
};

/**
 * Validate given user credentials
 * @param {*} user
 */
async function authenticate(user) {
  try {
    if (!user || !user.email) throw new NotAuthorizedError();
    if (!user.password) throw new NotAuthorizedError();

    const givenPassword = user.password;
    user = await checkLoginPresence({ query: { email: user.email } });
    let isMatch = await validatePassword(givenPassword, user.password);

    if (!isMatch) throw new NotAuthorizedError();

    return {
      token: getAuthToken(user.id, USER),
      user,
    };
  } catch (err) {
    throw new NotAuthorizedError();
  }
}

/**
 * Compare the given password with given hash
 * @param {String} candidatePassword
 * @param {String} passwordHash
 */
const validatePassword = async function (candidatePassword, passwordHash) {
  return bcrypt.compare(candidatePassword, passwordHash);
};

module.exports = {
  getValidAuthMethods,
  getRoutePermissions,
  getAuthToken,
  authenticate,
};
