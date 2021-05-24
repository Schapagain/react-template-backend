const { Image, Album } = require("../database/models");
const { getError, NotFoundError, ValidationError } = require("../utils/errors");
const { saveFiles, deleteFiles } = require("./files");
const { getAlbum } = require("./albums");

async function postImage(images) {
  let { userId, image } = images;
  const isMultipleUpload = Array.isArray(image);
  try {
    if (!image || (isMultipleUpload && !image.length))
      throw new ValidationError("image");

    if (!isMultipleUpload) {
      image = [image];
    }

    let savedImages = await saveFiles(...image);
    let results = await Image.bulkCreate(
      savedImages.map((im) => ({ ...im, userId }))
    );

    return { count: results.length, results };
  } catch (err) {
    throw await getError(err);
  }
}

async function getImages(userId) {
  try {
    const result = await Image.findAll({
      where: { userId },
      include: { model: Album, as: "album" },
    });
    return { count: result.length, results: result };
  } catch (err) {
    throw await getError(err);
  }
}

async function addToAlbum({ userId, albumId, id }) {
  try {
    const image = await getImage(userId, id);
    const album = await getAlbum(userId, albumId);

    if (!image || !album) throw new NotFoundError("image/album");

    await Image.update({ albumId }, { where: { id } });
    return { id, albumId };
  } catch (err) {
    throw await getError(err);
  }
}

async function getImage(userId, id) {
  try {
    if (!id || !userId || isNaN(Number(id)))
      throw new ValidationError("id/userId");
    const result = await Image.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("image");
    return { count: 1, results: result.dataValues };
  } catch (err) {
    throw await getError(err);
  }
}

async function deleteImage(userId, id) {
  try {
    if (!id || !userId || isNaN(Number(id)))
      throw new ValidationError("id/userId");
    const result = await Image.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("image");
    await Image.destroy({ where: { userId, id }, force: true });
    await deleteFiles(result.src);
    const { src } = result;
    return { id, src };
  } catch (err) {
    throw await getError(err);
  }
}

async function updateImage(image) {
  try {
    const { id, userId } = image;
    if (!id || !userId) throw new ValidationError("id/userId");

    let result = await Image.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("image");

    result = await Image.update(image, {
      where: { id },
      returning: true,
      plain: true,
    });
    const { title, name } = result[1].dataValues;
    return { id, title, name };
  } catch (err) {
    throw await getError(err);
  }
}

module.exports = {
  postImage,
  getImages,
  getImage,
  updateImage,
  deleteImage,
  addToAlbum,
};
