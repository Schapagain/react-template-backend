'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('distributors',{
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            },
        loginId:{
            type: Sequelize.INTEGER,
            foreignKey: true,
        },
        isSuperuser: {
            type: Sequelize.BOOLEAN,
            field: 'is_superuser'
        },
        usesPan: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            field: 'uses_pan'
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
        state: {
            type: Sequelize.STRING,
            allowNull: false
        },
        district: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        municipality: {
            type: Sequelize.STRING,
            allowNull: false
        },
        locality: {
            type: Sequelize.STRING,
        },
        ward: Sequelize.STRING,
        street: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lat: {
            type: Sequelize.FLOAT,
        },
        long: {
            type: Sequelize.FLOAT
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
            field: 'updated_at'
        },
        createdAt: {
            type: Sequelize.DATE,
            field: 'created_at'
        },
        website: Sequelize.STRING,
  })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('distributors');
  }
};
