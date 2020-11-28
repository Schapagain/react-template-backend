'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'countries',
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
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'countries',
      'distributor_id'
    )
  }
};