
const Sequelize = require('sequelize');
const db = require('../utils/db');

const Driver = db.define('Driver', {
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
    licenseDocument: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'license_document'
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    dob: Sequelize.DATE,
    address : Sequelize.STRING,
    profilePicture: {
        type: Sequelize.STRING,
        field: 'profile_picture',
    },
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
},{
    tableName: 'drivers',
    paranoid: true,
}
)

module.exports = Driver;