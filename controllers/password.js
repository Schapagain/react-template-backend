const bcrypt = require("bcrypt");
const { Login, Distributor } = require("../database/models");
const {
  getError,
  NotAuthorizedError,
  ValidationError,
  NotUniqueError,
  NotFoundError,
} = require("../utils/errors");
const { getRandomCode } = require("../utils");

const updatePassword = async (id, setPasswordCode, password) => {
  try {
    const user = await Login.findOne({
      where: { distributorId: id, setPasswordCode },
    });
    if (!user) throw new NotAuthorizedError("Code has expired");

    password = await generatePasswordHash(password);
    const updated = await Login.update(
      { password, setPasswordCode: null },
      { where: { distributorId: id } }
    );
    if (!updated) {
      throw new Error();
    }
  } catch (err) {
    throw await getError(err);
  }
};

const generatePasswordHash = async (passwordPlain) => {
  console.log(passwordPlain);
  try {
    const saltRounds = 5;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);
    return passwordHash;
  } catch (err) {
    throw err;
  }
};

const sendOTP = async (appId, phone) => {
  try {
    if (!phone) throw new ValidationError("phone", "not found");

    if (!appId) throw new ValidationError("appId", "not found");

    // Check if the distributor Exists
    const distributor = await Distributor.findOne({ where: { appId } });

    if (!distributor) throw new NotFoundError("distributor");

    const user = await distributor.getUsers({ where: { phone } });

    if (user) {
      // Generate random six-digit code
      const otpCode = getRandomCode(6);

      // store code to the databse
      Login.update({ otpCode }, { where: { phone } });

      //[TODO] send code via text
      console.log("OTP code for user: ", otpCode);
    }
  } catch (err) {
    throw await getError(err);
  }
};

const sendPasswordResetCode = async (email) => {
  // Check if the user exists
  let result = await Login.findOne({ where: { email } });

  if (result) {
    // Generate random six-digit code
    const setPasswordCode = getRandomCode(6);

    // store code to the databse
    Login.update(
      { ...result.dataValues, setPasswordCode },
      { where: { email } }
    );

    const { distributorId: id } = result;
    return { id, setPasswordCode };
  }
};

module.exports = {
  updatePassword,
  sendPasswordResetCode,
  sendOTP,
  generatePasswordHash,
};
