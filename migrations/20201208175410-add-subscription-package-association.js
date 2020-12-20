'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'subscriptions',
          'package_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'packages',
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
          'package_id'
        );
  }
};
