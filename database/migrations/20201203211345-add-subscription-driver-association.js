'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'drivers',
          'subscription_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'subscriptions',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          }
        );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
          'drivers',
          'subscription_id'
        );
  }
};
