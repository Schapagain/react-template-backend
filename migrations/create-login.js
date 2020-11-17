'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('login',{
      id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
      },
      email: Sequelize.STRING,
      phone: Sequelize.STRING,
      password: {
          type: Sequelize.STRING,
      },
      role: {
          type: Sequelize.STRING,
          allowNull: false
      },
      createdAt: {
          type: Sequelize.DATE,
          field: 'created_at'
      },
      updatedAt: {
          type: Sequelize.DATE,
          field: 'updated_at'
      },
      deletedAt: {
          type: Sequelize.DATE,
          field: 'deleted_at'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('login');
  }
};
