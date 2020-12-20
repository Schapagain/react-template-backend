'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
          'contacts',
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
        );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
          'contacts',
          'distributor_id'
        );
  }
};
