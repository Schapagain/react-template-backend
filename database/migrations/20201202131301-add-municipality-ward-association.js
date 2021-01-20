'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'wards',
      'municipality_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'municipalities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'wards',
      'municipality_id'
    )
  }
};