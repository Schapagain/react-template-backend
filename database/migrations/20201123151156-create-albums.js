"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "albums",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        story: {
          type: Sequelize.STRING,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updated_at",
        },
        deletedAt: {
          type: Sequelize.DATE,
          field: "deleted_at",
        },
      },
      { underscored: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("albums");
  },
};
