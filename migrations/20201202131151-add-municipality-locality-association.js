'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'localities',
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
    return queryInterface.removeColumn(
      'localities',
      'municipality_id'
    )
  }
};
