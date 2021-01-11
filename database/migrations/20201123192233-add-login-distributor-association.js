'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'login',
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
        )
    await queryInterface.addColumn(
          'distributors',
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
          'distributor_id'
        );
    await queryInterface.removeColumn(
          'distributors',
          'login_id'
        );
  }
};
