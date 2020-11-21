'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drivers', {
      distributorId: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'distributor_id',
          foreignKey: true,
      },
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
      phone: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
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
