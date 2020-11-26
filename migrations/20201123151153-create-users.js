'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users',{
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      phone: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
      },
      email: {
          type: Sequelize.STRING,
          unique: true,
      },
      referral: Sequelize.STRING,
      profilePicture: {
          type: Sequelize.STRING,
          field: 'profile_picture',
      },
      deletedAt: {
          type: Sequelize.DATE,
          field: 'deleted_at'
      },
      updatedAt: {
          type: Sequelize.DATE,
          field: 'updated_at'
      },
      createdAt: {
          type: Sequelize.DATE,
          field: 'created_at'
      },
  })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
