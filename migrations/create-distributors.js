'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('distributors',{
      adminId: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'admin_id',
      },
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        },
      uses_pan: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          field: 'uses_pan_or_vat'
      },
      panOrVat: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'pan_or_vat'
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false
      },
      country: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      language: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
      },
      phone: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
      },
      street: {
          type: Sequelize.STRING,
          allowNull: false
      },
      state: {
          type: Sequelize.STRING,
          allowNull: false
      },
      postal: {
          type: Sequelize.STRING,
          allowNull: false
      },
      licenseDocument: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'license_document'
      },
      profilePicture: {
          type: Sequelize.STRING,
          field: 'profile_picture',
      },
      deletedAt: {
          type: Sequelize.DATE,
          field: 'deleted_at'
      },
      updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'updated_at'
      },
      createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'created_at'
      },
      district: Sequelize.STRING,
      municipality: Sequelize.STRING,
      ward: Sequelize.STRING,
      website: Sequelize.STRING,
  })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('distributors');
  }
};
