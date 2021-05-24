const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const formParser = require("../../middlewares/formParser");
const {
  postUser,
  getUsers,
  getUser,
  updateUser,
  disableUser,
  registerUser,
} = require("../../controllers/users");
const path = require("path");
const fs = require("fs");

/**
 * Route for a user to signup
 * @name    api/users/signup
 * @method  POST
 * @access  Public
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.post("/signup", formParser, async (req, res) => {
  try {
    let result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({
      error: {
        field: err.field,
        msg: err.message,
      },
    });
  }
});

/**
 * Route to add a new user
 * @name    api/users
 * @method  POST
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.post("/", auth, formParser, async (req, res) => {
  try {
    let result = await postUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({
      error: {
        field: err.field,
        msg: err.message,
      },
    });
  }
});

/**
 * Route to get user info
 * @name    api/users/:id
 * @method  GET
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    // Get info from database
    const result = await getUser(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode).json({ error: err.message });
  }
});

/**
 * Route to get all users
 * @name    api/users
 * @method  GET
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    let result = await getUsers(userId);
    if (!result) throw new Error();

    result.data = result.data.map((user) => ({
      ...user,
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to delete a user
 * @name    api/users/:id
 * @method  DELETE
 * @access  Admin
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const id = req.params.id;
    let result = await disableUser(userId, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode).json({ error: err.message });
  }
});

/**
 * Route to update user info
 * @name    api/users/:id
 * @method  PUT
 * @access  User
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.put("/:id", auth, formParser, async (req, res) => {
  try {
    const id = req.params.id;
    let result = await updateUser({ ...req.body, id });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.httpCode).json({
      error: {
        field: err.field,
        msg: err.message,
      },
    });
  }
});

module.exports = router;
