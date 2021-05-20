"use strict";

const { generatePasswordHash } = require("../../controllers/password");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Mortal Person",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );
    console.log("users::", users);
    const logins = await queryInterface.bulkInsert(
      "login",
      [
        {
          user_id: users[0].id,
          username: "mortal",
          password: await generatePasswordHash("mortal123"),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );
    await queryInterface.bulkUpdate("users", {
      login_id: logins[0].id,
    });
  },
};
