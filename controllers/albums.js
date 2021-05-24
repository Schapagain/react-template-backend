const { Album, Image, Sequelize } = require("../database/models");
const { getError, NotFoundError, ValidationError } = require("../utils/errors");

async function postAlbum(album) {
  try {
    await Album.create(album);
    const { id, name } = album;
    return { id, name };
  } catch (err) {
    throw await getError(err);
  }
}

async function getAlbums(userId) {
  try {
    const result = await Album.findAll({
      where: { userId },
    });
    const imageCounts = await Promise.all(
      result.map((album) =>
        Image.count({ where: { albumId: album.id, userId } })
      )
    );
    return {
      count: result.length,
      results: result.map((album, index) => ({
        ...album.dataValues,
        imageCount: imageCounts[index],
      })),
    };
  } catch (err) {
    throw await getError(err);
  }
}

async function getAlbum(userId, id) {
  try {
    if (!id || !userId || isNaN(Number(id)))
      throw new ValidationError("id/userId");
    const result = await Album.findOne({
      where: { userId, id },
      include: { model: Image, as: "images" },
    });
    if (!result) throw new NotFoundError("album");
    return result.dataValues;
  } catch (err) {
    throw await getError(err);
  }
}

async function deleteAlbum(userId, id) {
  try {
    if (!id || !userId || isNaN(Number(id)))
      throw new ValidationError("id/userId");
    const result = await Album.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("album");
    Album.destroy({ where: { userId, id }, force: true });
    const { name } = result;
    return { id, name };
  } catch (err) {
    throw await getError(err);
  }
}

async function disableAlbum(userId, id) {
  try {
    if (!id || !userId || isNaN(Number(id)))
      throw new ValidationError("id/userId");
    const result = await Album.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("album");
    Album.destroy({ where: { userId, id } });
    const { name } = result;
    return { id, name };
  } catch (err) {
    throw await getError(err);
  }
}

/**
 * Add given images to the album
 *
 */
async function addImages({ ids, userId, albumId }) {
  try {
    if (!ids || !ids.length || !userId || isNaN(Number(albumId)))
      throw new ValidationError("ids/albumId");
    let result = await Album.findOne({ where: { userId, id: albumId } });
    if (!result) throw new NotFoundError("album");

    result = await Image.update(
      { albumId },
      {
        where: { id: ids },
        returning: true,
        plain: true,
      }
    );

    return { albumId };
  } catch (err) {
    throw await getError(err);
  }
}

async function updateAlbum(album) {
  try {
    const { id, userId } = album;
    if (!id || !userId || isNaN(Number(id)))
      throw new ValidationError("id/userId");
    let result = await Album.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("album");

    result = await Album.update(album, {
      where: { id },
      returning: true,
      plain: true,
    });
    const { name, story } = result[1].dataValues;
    return { id, name, story };
  } catch (err) {
    throw await getError(err);
  }
}

module.exports = {
  postAlbum,
  getAlbums,
  getAlbum,
  updateAlbum,
  disableAlbum,
  deleteAlbum,
  addImages,
};
