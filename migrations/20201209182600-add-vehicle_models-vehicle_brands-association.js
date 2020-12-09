'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        queryInterface.addColumn(
          'vehicle_models',
          'brand_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'vehicle_brands',
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
          'vehicles_models',
          'brand_id'
        )
      ]);
  }
};
