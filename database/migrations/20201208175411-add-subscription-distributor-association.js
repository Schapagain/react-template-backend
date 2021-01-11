'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'subscriptions',
          'distributor_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'distributors',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          }
        );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
          'subscriptions',
          'distributor_id'
        );
  }
};
