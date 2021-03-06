"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("images", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      src: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      secure_src: Sequelize.STRING,
      width: Sequelize.INTEGER,
      height: Sequelize.INTEGER,
      placeholder: Sequelize.STRING,
      format: Sequelize.STRING,
      size: Sequelize.INTEGER,
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("images");
  },
};
