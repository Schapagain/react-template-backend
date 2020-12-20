'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'vehicles',
          'model_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'vehicle_models',
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
          'model_id'
        );
  }
};
