'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('vehicle_models',{
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
          uinque: true,
      },
      year: {
          type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('vehicle_models');
  }
};
