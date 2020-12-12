'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicles',{
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        },
      registrationDocument: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'registration_document'
      },
      licensePlate: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'license_plate',
      },
      modelYear: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'model_year',
      },
      chassisNumber: {
          type: Sequelize.STRING,
          field: 'chassis_number',
      },
      seats: Sequelize.INTEGER,
      doors: Sequelize.INTEGER,
      color: Sequelize.STRING,
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
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vehicles');
  }
};
