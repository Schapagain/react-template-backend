const { Sequelize } = require('sequelize');
const Sequelise = require('sequelize');
const db = require('../utils/db');

const Vehicle = db.define('Vehicle', {
    distributorId: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'distributor_id',
        foreignKey: true,
    },
    driverId: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'driver_id',
        foreignKey: true,
    },
    id: {
        type: Sequelise.STRING,
        allowNull: false,
        primaryKey: true,
    },
    registrationDocument: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'registration_document'
    },
    model: {
        type: Sequelise.STRING,
        allowNull: false
    },
    licensePlate: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'license_plate',
    },
    modelYear: {
        type: Sequelise.STRING,
        allowNull: false,
        field: 'model_year',
    },
    company: {
        type: Sequelise.STRING,
        allowNull: false,
    },
    chassisNumber: {
        type: Sequelise.STRING,
        field: 'chassis_number',
    },
    seats: Sequelise.NUMBER,
    doors: Sequelise.NUMBER,
    color: Sequelise.STRING,
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at'
    }
},{
    tableName: 'vehicles',
}
)

module.exports = Vehicle;