'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        queryInterface.addColumn(
          'vehicles',
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
          'vehicle_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'vehicles',
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
          'vehicles',
          'driver_id'
        ),
        queryInterface.removeColumn(
          'drivers',
          'vehicle_id'
        )
      ]);
  }
};
