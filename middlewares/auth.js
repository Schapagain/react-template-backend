const njwt = require("njwt");
require("dotenv").config();
const signingKey = process.env.SECRET_KEY;
const {
  getError,
  ValidationError,
  NotAuthorizedError,
} = require("../utils/errors");

const { ADMIN } = require("../utils/roles");
const {
  getValidAuthMethods,
  getRoutePermissions,
} = require("../controllers/auth");

/**
 * Verify that the role and id associated with the token
 * is allowed to access the attempted route
 */
const auth = async (req, res, next) => {
  try {
    // Get token from the header
    const token = parseAuthHeader(req.header("authorization"));
    const { id, role } = parseToken(token, signingKey);
    await verifyRouteOwnership(req.baseUrl, req.params.id, id, role);

    // Inject userId into req before proceeding
    req.auth = { id, role };
    next();
  } catch (err) {
    next(await getError(err));
  }
};

/**
 * Extracts user token from Authorization header
 * @param {String} authHeader
 */
function parseAuthHeader(authHeader) {
  const [authMethod, userToken] = authHeader ? authHeader.split(" ") : ["", ""];

  // ensure existence of auth method and token in correct format
  if (!userToken && !authMethod) throw new ValidationError("token");
  const methodIsValid = getValidAuthMethods().includes(
    authMethod.toLowerCase()
  );
  if (!authMethod || !methodIsValid)
    throw new ValidationError("token", "auth format not supported");
  if (!userToken) throw new ValidationError("token");

  return userToken;
}

/**
 * Verify the given token, and return owner's id, role
 * @param {String} userToken
 * @param {String} signingKey
 */
function parseToken(userToken, signingKey) {
  const token = njwt.verify(userToken, signingKey);
  const id = token.body.sub;
  const role = token.body.scope;
  return { id, role };
}

/**
 * only allow authorized users through
 * resourceId and userId together can be used to precheck if the user owns the given resource
 * @param {String} baseUrl
 * @param {String} resourceId
 * @param {String} userId
 * @param {String} role
 */
async function verifyRouteOwnership(baseUrl, resourceId, userId, role) {
  // Allow admins unrestricted access
  if (role === ADMIN) return;

  // Check route permissions
  const modelMap = getRoutePermissions();
  const apiBaseString = baseUrl.split("/").pop();

  // the _ below is the model belonging to the resource
  // it'll be useful if you have to query any models before determining authority
  const [_, allowedRoles] = modelMap[apiBaseString];
  if (!allowedRoles.has(role)) throw new NotAuthorizedError("Restricted route");

  // Check if a user is trying to access another user's details
  if (apiBaseString === "users" && resourceId != userId)
    throw resourceId
      ? new NotAuthorizedError("Private route")
      : new NotAuthorizedError("Restricted route");
}

module.exports = auth;
