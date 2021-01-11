'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'login',
          'driver_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'drivers',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          }
        );
    await queryInterface.addColumn(
          'drivers',
          'login_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'login',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          }
        );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
          'login',
          'driver_id'
        );
    await queryInterface.removeColumn(
          'drivers',
          'login_id'
        );
  }
};
