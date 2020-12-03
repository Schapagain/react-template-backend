'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drivers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      licenseDocument: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'license_document'
      },
      subscriptionType:{
        type: Sequelize.STRING,
        allowNull: false,
        field: 'subscription_type',
      },
      cutPercent:{
          type: Sequelize.INTEGER,
          field: 'cut_percent'
      },
      phone: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      dob: Sequelize.DATE,
      address : Sequelize.STRING,
      profilePicture: {
          type: Sequelize.STRING,
          field: 'profile_picture',
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
    await queryInterface.dropTable('drivers');
  }
};
