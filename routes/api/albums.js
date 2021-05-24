const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const formParser = require("../../middlewares/formParser");
const {
  postAlbum,
  getAlbums,
  getAlbum,
  updateAlbum,
  disableAlbum,
  addImages,
} = require("../../controllers/albums");
const path = require("path");
const { expectedFiles } = require("../../utils");
const fs = require("fs");
const { ValidationError } = require("../../utils/errors");

/**
 * Route to add a new album
 * @name    api/albums
 * @method  POST
 * @access  Admin/Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.post("/", auth, formParser, async (req, res) => {
  try {
    const album = req.body;
    const userId = req.auth.id;
    let result = await postAlbum({ ...album, userId });
    if (!result) throw new Error();
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
 * Route to get album info
 * @name    api/albums/:id
 * @method  GET
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const id = req.params.id;
    const result = await getAlbum(userId, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to get all albums
 * @name    api/albums
 * @method  GET
 * @access  Admin/Distributor
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    let result = await getAlbums(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to delete a album
 * @name    api/albums/:id
 * @method  DELETE
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const id = req.params.id;
    let result = await disableAlbum(userId, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.httpCode || 500).json({ error: err.message });
  }
});

/**
 * Route to update album info
 * @name    api/albums/:id
 * @method  PUT
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.put("/:id", auth, formParser, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.auth.id;
    let result = await updateAlbum({ ...req.body, userId, id });
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
 * Route to add preexisting images to an album
 * @name    api/albums/:id/add_images
 * @method  POST
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Form Parser
 * @param   {callback} middleware - Handle HTTP response
 */
router.post("/:id/add_images", auth, formParser, async (req, res) => {
  try {
    const albumId = req.params.id;
    const userId = req.auth.id;
    let result = await addImages({ ...req.body, userId, albumId });
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
 * Route to get album files
 * @name    api/albums/:id/files/:fileName
 * @method  GET
 * @access  Private
 * @inner
 * @param   {string} path
 * @param   {callback} middleware - Authenticate
 * @param   {callback} middleware - Handle HTTP response
 */
router.get("/:id/files/:fileName", auth, async (req, res) => {
  const rootPath = path.join(".", "uploads");
  const { fileName } = req.params;
  try {
    await fs.promises.access(path.join(rootPath, fileName));
    res.sendFile(fileName, { root: rootPath });
  } catch (err) {
    if (err.code === "ENOENT") {
      res.status(404).json({ error: "File not found" });
    } else {
      err = getError(err);
      res.status(err.httpCode || 500).json({ error: err.message });
    }
  }
});

module.exports = router;
