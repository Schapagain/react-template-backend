'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        queryInterface.addColumn(
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
        ),
        queryInterface.addColumn(
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
        )
      ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        queryInterface.removeColumn(
          'login',
          'driver_id'
        ),
        queryInterface.removeColumn(
          'drivers',
          'login_id'
        )
      ]);
  }
};
