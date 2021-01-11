'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'wards',
      'locality_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'localities',
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
      'locality_id'
    )
  }
};
