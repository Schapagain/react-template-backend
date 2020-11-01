const Sequelise = require('sequelize');
const db = require('../utils/db');

const Distributor = db.define('distributor', {
    parent: {
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
},{
    createdAt: 'createdat',
    updatedAt: 'updatedat'
})

module.exports = Distributor;