'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'municipalities',
      'district_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'districts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'municipalities',
      'district_id'  
    )
  }
};
