'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
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
        );
    await queryInterface.addColumn(
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
        );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
          'vehicles',
          'driver_id'
        );
    await queryInterface.removeColumn(
          'drivers',
          'vehicle_id'
        );
  }
};
