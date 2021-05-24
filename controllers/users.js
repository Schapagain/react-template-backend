const fs = require("fs");
const path = require("path");
const { getError } = require("../utils/errors");

const { Distributor, Login, User, sequelize } = require("../database/models");
const { expectedFiles } = require("../utils");
const {
  ValidationError,
  NotFoundError,
  NotAuthorizedError,
} = require("../utils/errors");
const { queryDatabase } = require("../database");
const { generatePasswordHash } = require("./password");
const { saveFiles } = require("./files");
/**
 * Check if any login with the given parameters exists in the database
 * , and return the first login found
 * @param {object} query
 * @param {String[]} attributes
 */
async function checkLoginPresence({ query, attributes = ["id"] }) {
  try {
    const users = await queryDatabase({ query, attributes });
    if (!users || !users.length) throw new NotFoundError("login");
    return users[0];
  } catch (err) {
    throw await getError(err);
  }
}

/**
 * Returns an array of all files that are expected and are passed in as keys,
 * and removes those from the user object.
 * @param {*} user - has side effects; must be passed by reference
 * @returns
 */
function extractExpectedFiles(user) {
  // Extract unique files for each fields
  return expectedFiles
    .map((fieldName) => {
      if (fieldName in user) {
        let file = user[fieldName];
        if (Array.isArray(file)) file = file[0];
        delete user[fieldName]; // we don't wanna try and store files to db
        return file || null;
      } else {
        return undefined;
      }
    })
    .filter((file) => file !== undefined);
}

/**
 * Add a new user
 * @param {*} user
 * @returns
 */
async function postUser(user) {
  let allFiles = extractExpectedFiles(user);

  try {
    // create user and the login association in the same transaction
    // to automatically roll back changes in case of errors
    const result = await sequelize.transaction(async (t) => {
      const { username, name, password } = user;
      user = await User.create(user, { transaction: t });

      const { id: userId } = user;
      const passwordHash = await generatePasswordHash(password);
      const { id: loginId } = await user.createLogin(
        { name, username, userId, password: passwordHash },
        { transaction: t }
      );
      allFiles = await saveFiles(...allFiles);
      const filedsToUpdate = {
        loginId,
        ...expectedFiles.reduce(
          (acc, field, index) => ({
            ...acc,
            [field]: allFiles[index] && allFiles[index]["src"],
          }),
          {}
        ),
      };
      await User.update(filedsToUpdate, {
        where: { id: userId },
        transaction: t,
      });
      return { id: userId, username, name };
    });
    return result;
  } catch (err) {
    throw await getError(err);
  }
}

async function updateUser(user) {
  let allFiles = extractExpectedFiles(user);
  try {
    const { id } = user;
    if (!id || isNaN(Number(id))) throw new ValidationError("id");

    let result = await User.findOne({ where: { id } });
    if (!result) throw new NotFoundError("user");
    console.log(allFiles);
    allFiles = await saveFiles(...allFiles);
    const filesToUpdate = expectedFiles.reduce(
      (acc, field, index) => ({
        ...acc,
        [field]: allFiles[index] && allFiles[index]["src"],
      }),
      {}
    );

    result = await User.update(
      { ...user, ...filesToUpdate },
      {
        where: { id },
        returning: true,
        plain: true,
      }
    );
    const { name, profilePicture } = result[1].dataValues;
    return { id, name, profilePicture };
  } catch (err) {
    throw await getError(err);
  }
}

/**
 * Alias for posting a user
 * @param {*} user
 */
async function registerUser(user) {
  return await postUser(user);
}

function _deleteFiles(user) {
  expectedFiles.forEach((fileName) => {
    if (user[fileName]) {
      const filePath = path.join(".", "uploads", user[fileName]);
      fs.unlink(filePath, (err) => console.log(err));
    }
  });
}

async function getUser(id) {
  try {
    if (!id || isNaN(Number(id))) throw new ValidationError("id");

    let user = await User.findAll({ where: { id } });
    if (!user || !user.length) throw new NotFoundError("user");
    return { count: 1, results: user.map((user) => user.dataValues) };
  } catch (err) {
    throw await getError(err);
  }
}

async function getUsers() {
  try {
    let allUsers = await User.findAll({ include: Login });
    allUsers = await Promise.all(
      allUsers.map(async (user) => {
        const { id, name, profilePicture, Login } = user;
        return { id, name, username: Login.username, profilePicture };
      })
    );
    return { count: allUsers.length, results: allUsers };
  } catch (err) {
    throw await getError(err);
  }
}

async function deleteUser(userId, id) {
  try {
    if (!id) throw new ValidationError("id");
    if (!userId) throw new ValidationError("userId");

    const result = await User.findOne({ where: { userId, id } });
    if (!result) throw new NotFoundError("user");

    _deleteFiles(result.dataValues);
    User.destroy({ where: { userId, id }, force: true });

    const { phone, name } = result;
    return { id, name, phone };
  } catch (err) {
    console.log(err);
  }
}

async function disableUser(userId, id) {
  try {
    const distributor = await Distributor.findOne({
      where: { id: userId },
    });
    if (!distributor)
      throw new NotAuthorizedError(
        "distributor with that token/id does not exist"
      );
    let user;
    if (distributor.isSuperuser) user = await User.findOne({ where: { id } });
    else user = await User.findOne({ where: { userId, id } });
    if (!user) throw new NotFoundError("user");

    User.destroy({ where: { id } });
    const { phone, name } = user;
    return { id, userId: user.userId, name, phone };
  } catch (err) {
    throw await getError(err);
  }
}

module.exports = {
  postUser,
  registerUser,
  getUsers,
  getUser,
  updateUser,
  disableUser,
  deleteUser,
  checkLoginPresence,
};
