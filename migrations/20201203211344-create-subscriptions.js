'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      cutPercent:{
          type: Sequelize.INTEGER,
          field: 'cut_percent'
      },
      startsAt:{
        type: Sequelize.DATE,
        defaultValue: DataTypes.NOW,
        field: 'starts_at'
      },
      expiresAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'expires_at'
      },
      createdAt: {
          type: Sequelize.DATE,
          field: 'created_at'
      },
      updatedAt: {
          type: Sequelize.DATE,
          field: 'updated_at'
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
      }
    }); 
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscriptions');
  }
};
