'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicles',{
      distributorId: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'distributor_id',
          foreignKey: true,
      },
      driverId: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'driver_id',
          foreignKey: true,
      },
      id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
      },
      registrationDocument: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'registration_document'
      },
      model: {
          type: Sequelize.STRING,
          allowNull: false
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
      company: {
          type: Sequelize.STRING,
          allowNull: false,
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