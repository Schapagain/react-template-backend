const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const formParser = require("../../middlewares/formParser");
const {
  postImage,
  getImage,
  deleteImage,
  getImages,
  addToAlbum,
} = require("../../controllers/images");

/**
 * Route to add a new image
 * @name    api/images
 * @method  POST
 * @access  User
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.post("/", auth, formParser, async (req, res) => {
  try {
    const image = req.body;
    const userId = req.auth.id;
    let result = await postImage({ ...image, userId });
    res.status(201).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to get image info
 * @name    api/images/:id
 * @method  GET
 * @access  User
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const id = req.params.id;
    const result = await getImage(userId, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to get all images
 * @name    api/images
 * @method  GET
 * @access  User
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    let result = await getImages(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to add an image to an album
 * @name    api/images
 * @method  GET
 * @access  User
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/:id/add_to_album/:albumId", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const { id, albumId } = req.params;
    let result = await addToAlbum({ userId, id, albumId });
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to delete a image
 * @name    api/images/:id
 * @method  DELETE
 * @access  User
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const id = req.params.id;
    let result = await deleteImage(userId, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

module.exports = router;
