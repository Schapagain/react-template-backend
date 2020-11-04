
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.createTable('distributors', {
        adminId: {
          type: Sequelise.STRING,
          allowNull: false,
      },
        name: {
          type: Sequelise.STRING,
          allowNull: false
      },
      country: {
          type: Sequelise.STRING,
          allowNull: false
      },
      language: {
          type: Sequelise.STRING,
          allowNull: false
      },
      email: {
          type: Sequelise.STRING,
          allowNull: false
      },
      phone: {
          type: Sequelise.STRING,
          allowNull: false
      },
      street: {
          type: Sequelise.STRING,
          allowNull: false
      },
      state: {
          type: Sequelise.STRING,
          allowNull: false
      },
      postal: {
          type: Sequelise.STRING,
          allowNull: false
      },
      district: {
          type: Sequelise.STRING,
      },
      municipality: {
          type: Sequelise.STRING,
      },
      ward: {
          type: Sequelise.STRING,
      },
      website: {
          type: Sequelise.STRING,
      },
      createdAt: {
          type: Sequelize.DATE,
          field: 'created_at'
      },
      updatedAt: {
          type: Sequelize.DATE,
          field: 'updated_at',
      }
  });

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.dropTable('distributors');
  }
};
