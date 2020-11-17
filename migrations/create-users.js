'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users',{
      distributorId: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'distributor_id',
          foreignKey: true,
      },
      id: {
          type: Sequelize.STRING,
          allowNull: false,
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
          allowNull: false,
          field: 'deleted_at'
      },
      updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'updated_at'
      },
      createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'created_at'
      },
  })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
