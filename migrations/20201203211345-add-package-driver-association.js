'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
          'drivers',
          'package_id',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'packages',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          }
        );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
          'drivers',
          'package_id'
        );
  }
};
