'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contacts',{
      distributorId: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'distributor_id',
          foreignKey: true,
      },
      id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      jobPosition: {
          type: Sequelize.STRING,
          field: 'job_position',
      },
      title: Sequelize.STRING,
      email: Sequelize.STRING,
      phone: Sequelize.STRING,
      mobile: Sequelize.STRING,
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
    await queryInterface.dropTable('contacts');
  }
};
