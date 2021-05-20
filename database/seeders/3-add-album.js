"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const albums = await queryInterface.bulkInsert(
      "albums",
      [
        {
          name: "Colgate Chapters",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );
    await queryInterface.bulkUpdate("images", {
      album_id: albums[0].id,
    });
  },
};
