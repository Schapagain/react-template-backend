'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      return Promise.all([queryInterface.bulkInsert('distributors',[{
        uses_pan: true,
        pan_or_vat: 999999,
        name: 'Super User',
        country: 'Nepal',
        language: 'Nepali',
        email: 'admin@admin.com',
        phone: '1111111111',
        street: '111',
        state: '111',
        postal: '111',
        license_document: '111.jpg'
      }],{}),
      queryInterface.bulkInsert('login',[{
        distributor_id: 1,
        email: 'admin@admin.com',
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
