'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      return Promise.all([queryInterface.bulkInsert('distributors',[{
        uses_pan: true,
        pan: 999999,
        name: 'Super User',
        is_superuser: true,
        country: 'Nepal',
        state: 'Bagmati',
        district: 'kathmandu',
        municipality: 'kathmandu',
        language: 'Nepali',
        email: 'admin@admin.com',
        phone: '1111111111',
        license_document: '111.jpg'
      }],{}),
      queryInterface.bulkInsert('login',[{
        distributor_id: 1,
        email: 'admin@admin.com',
        password: 'password77',
        phone: '1111111111',
        active: true,
      }]),
      queryInterface.bulkUpdate('distributors',{
        login_id: 1
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('distributors',null,{});
  }
};
