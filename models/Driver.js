const { Sequelize } = require('sequelize');
const Sequelise = require('sequelize');
const db = require('../utils/db');

const Driver = db.define('Driver', {
    distributorId: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'distributor_id',
        foreignKey: true,
    },
    id: {
        type: Sequelise.STRING,
        allowNull: false,
        primaryKey: true,
    },
    phone: {
        type: Sequelise.STRING,
        allowNull: false
    },
    name: {
        type: Sequelise.STRING,
        allowNull: false,
    },
    dob: Sequelise.DATE,
    address : Sequelise.STRING,
    profilePicture: {
        type: Sequelise.STRING,
        field: 'profile_picture',
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at'
    }
},{
    tableName: 'drivers',
}
)

module.exports = Driver;