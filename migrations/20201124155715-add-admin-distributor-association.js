'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'distributors',
          'parent_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'distributors',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          }
        );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
          'distributors',
          'parent_id'
        );
  }
};
