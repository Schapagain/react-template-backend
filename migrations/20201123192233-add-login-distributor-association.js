'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        queryInterface.addColumn(
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
        ),
        queryInterface.addColumn(
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
        )
      ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        queryInterface.removeColumn(
          'login',
          'distributor_id'
        ),
        queryInterface.removeColumn(
          'distributors',
          'login_id'
        )
      ]);
  }
};
