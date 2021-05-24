const { getError } = require("../utils/errors");
const cloudinary = require("cloudinary").v2;
const { asyncForEach } = require("../utils");
const defaultPrefix = "default";
const uploadOptions = {
  use_filename: false,
  folder: "lapse",
};

/**
 * Update the file at the given oldUrl
 * return the details of the new File
 * @param {File} file
 * @param {String} oldUrl
 */
async function updateCloudinaryFile(file, oldUrl) {
  try {
    const newFile = await uploadToCloudinary(file.path);
    deleteFromCloudinary(oldUrl);
    return newFile;
  } catch (err) {
    throw await getError(err);
  }
}

/**
 * Upload file at the given path to cloudinary
 * @param {String} imagePath
 */
function uploadToCloudinary(imagePath) {
  console.log("saving to cloudinary::", imagePath);
  const fieldsToSave = [
    "width",
    "height",
    "format",
    "created_at",
    { from: "bytes", to: "size" },
    { from: "url", to: "src" },
    { from: "secure_url", to: "secureSrc" },
  ];
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imagePath, uploadOptions, (err, result) => {
      if (err) return reject(err);
      return resolve(
        fieldsToSave.reduce(
          (acc, field) =>
            field.from
              ? { ...acc, [field.to]: result[field.from] }
              : { ...acc, [field]: result[field] },
          {}
        )
      );
    });
  });
}

/**
 * Extract the public id from the given cloudinary url
 * @param {String} url
 */
function getPublicIdFromUrl(url) {
  const publicId = url.split("/").slice(-1)[0].split(".")[0];
  return uploadOptions.folder
    ? uploadOptions.folder.concat("/", publicId)
    : publicId;
}

/**
 * Delete image from cloudinary
 * unless it's the default image
 * @param {String} imageUrl
 */
function deleteFromCloudinary(imageUrl) {
  const publicId = getPublicIdFromUrl(imageUrl);
  if (!publicId.includes(defaultPrefix)) {
    cloudinary.uploader.destroy(getPublicIdFromUrl(imageUrl));
  }
}

/**
 * Save all the files in the arguments to cloud storage
 */
async function saveFiles() {
  const files = [...arguments];
  if (!files) return [];
  try {
    const results = await Promise.all(
      files.map((file) => {
        if (!file || !file.path) {
          return null;
        } else {
          return uploadToCloudinary(file.path);
        }
      })
    );
    return results;
  } catch (err) {
    throw await getError(err);
  }
}

/**
 * Replace the file at the oldUrl with the given file
 * return url to the new file
 * @param {File} newFile
 * @param {String} oldUrl
 */
async function updateFile(newFile, oldUrl) {
  let newUrl;
  try {
    newUrl = await updateCloudinaryFile(newFile, oldUrl);
    return newUrl;
  } catch (err) {
    throw await getError(err);
  }
}

/**
 * Delete files by file urls
 */
async function deleteFiles() {
  fileUrls = [...arguments];
  if (!fileUrls || !fileUrls[0]) return;
  try {
    await asyncForEach(fileUrls, async (url) => {
      if (typeof url === "string") deleteFromCloudinary(url);
    });
  } catch (err) {
    throw await getError(err);
  }
}

module.exports = { saveFiles, deleteFiles, updateFile };
