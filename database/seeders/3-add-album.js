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
          user_id: 1,
          story:
            "I am not much of a photographer, but I do snap some occassionally when I bike around Hamilton. This album hold all those memories.",
        },
      ],
      { returning: true }
    );
    await queryInterface.bulkUpdate(
      "images",
      {
        album_id: albums[0].id,
      },
      {
        id: [1, 2, 3, 4],
      }
    );
  },
};
