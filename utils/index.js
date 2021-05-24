const { v4: uuid } = require("uuid");
const { USER } = require("./roles");

const expectedFiles = ["profilePicture"];

const getRandomId = () => uuid().slice(0, 5);

const getRandomCode = (length) =>
  Math.floor(
    Math.random() * (10 ** length - 10 ** (length - 1)) + 10 ** (length - 1)
  );

const getRoles = (user) => {
  const { userId } = user;
  let roles = [];
  if (userId) roles.push({ role: USER, id: userId });
  return roles;
};

/**
 * Util to handle asynchronous forEach
 * @param {*} array
 * @param {Function} callback
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
module.exports = {
  expectedFiles,
  getRandomId,
  getRandomCode,
  getRoles,
  asyncForEach,
};
