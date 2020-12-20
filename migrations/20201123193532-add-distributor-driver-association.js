'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'drivers',
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
    await queryInterface.removeColumn(
      'drivers',
      'distributor_id'
    )
  }
};
