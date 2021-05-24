const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getAuthToken } = require("../../controllers/auth");
const { getRoles } = require("../../utils");
const { Login } = require("../../database/models");
const formParser = require("../../middlewares/formParser");
const { getError, NotAuthorizedError } = require("../../utils/errors");

/**
 * Route to authenticate a user
 * @name    api/auth
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.post("/", formParser, async (req, res) => {
  let { username, password } = req.body;
  // Check if all fields are given
  if (!(username && password)) {
    return res.status(400).json({
      error: "Please provide username/password",
    });
  }

  try {
    // Check if the user exists
    let result = await Login.findOne({ where: { username } });
    if (!result) throw new NotAuthorizedError("");

    // Compare username/password combination
    let passwordHash = result.password;
    const credentialsMatch = await bcrypt.compare(password, passwordHash);
    if (!credentialsMatch)
      return res.status(401).json({ error: "Unauthorized" });

    // Get all roles and relevant ids for the user
    let role = getRoles(result);
    ({ id, role } = { ...role.shift() });
    ({ username } = result);
    const user = { id, username, role };
    const token = await getAuthToken(id, role);
    res.status(200).json({
      token,
      user,
    });
  } catch (err) {
    err = await getError(err);
    return res.status(err.httpCode || 500).json({ error: err.message });
  }
});

module.exports = router;
